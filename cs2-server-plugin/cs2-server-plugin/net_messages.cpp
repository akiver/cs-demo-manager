#include "net_messages.h"

#include <cstring>
#include <string>

#include "icvar.h"
#include "library.h"
#include "log.h"
#include "netmessages.pb.h"
#include "networksystem/inetworkmessages.h"
#include "tier0/bitbuf.h"
#include "user_commands.h"
#include "voice_activity.h"
#include "vtable.h"

#ifdef _WIN32
#define NETWORK_SYSTEM_LIB_NAME "networksystem.dll"
#else
#define NETWORK_SYSTEM_LIB_NAME "libnetworksystem.so"
#endif
// Slots of INetworkMessages. Its virtual destructor is declared last, so these indexes are the same on Windows and
// Linux.
//
// The slot owning the instruction that loads the "illegal to register new net messages after serialization" string.
constexpr int findOrCreateNetMessageVtableIndex = 2;
// Two slots past FindOrCreateNetMessage, after Serialize.
constexpr int unserializeMessageInternalVtableIndex = 4;

// svc_UserCmds, the id CSVCMsg_UserCommands is registered under, see SVC_Messages in netmessages.proto.
constexpr int userCmdsMessageId = 76;
// svc_VoiceData, the id CSVCMsg_VoiceData is registered under. Its packets tell who is talking.
constexpr int voiceDataMessageId = 47;

typedef bool (*NetMessageUnserializeFn)(void* thisptr, bf_read& buf, CNetMessage* msg);
typedef INetworkMessageInternal* (*FindOrCreateNetMessageFn)(void* thisptr, int messageId,
                                                             const IProtobufBinding* protoBinding,
                                                             unsigned int messageSize,
                                                             INetworkSerializerBindingBuildFilter* buildFilter,
                                                             bool createIfNotFound, bool autoAssignId);

static INetworkMessages* gNetworkMessages = NULL;
static INetworkMessageInternal* userCmdsNetMessage = NULL;
static INetworkMessageInternal* voiceDataNetMessage = NULL;
static NetMessageUnserializeFn originalUnserializeMessageInternal = NULL;
static FindOrCreateNetMessageFn originalFindOrCreateNetMessage = NULL;

// Avoids casting AsProto() onto our generated class: protobuf orders members by type, so a field Valve adds can shift
// the offsets. Serializing the engine's object through its own virtuals and parsing the bytes doesn't depend on the
// layout.
template <typename T>
static bool CopyEngineMessage(const CNetMessage* msg, T* copy) {
    const google::protobuf::MessageLite* engineMessage = (const google::protobuf::MessageLite*)msg->AsProto();
    if (engineMessage == NULL) {
        return false;
    }

    std::string bytes;
    if (!engineMessage->SerializePartialToString(&bytes)) {
        return false;
    }

    return copy->ParseFromString(bytes);
}

static bool NewUnserializeMessageInternal(void* thisptr, bf_read& buf, CNetMessage* msg) {
    bool result = originalUnserializeMessageInternal(thisptr, buf, msg);

    if (!result || msg == NULL) {
        return result;
    }

    INetworkMessageInternal* netMessage = msg->GetNetMessage();
    if (voiceDataNetMessage != NULL && netMessage == voiceDataNetMessage) {
        CSVCMsg_VoiceData voiceData;
        if (CopyEngineMessage(msg, &voiceData)) {
            RecordVoicePacket(voiceData.xuid(), voiceData.entity());
        }
        return result;
    }

    if (userCmdsNetMessage == NULL || netMessage != userCmdsNetMessage) {
        return result;
    }

    CSVCMsg_UserCommands userCommands;
    if (CopyEngineMessage(msg, &userCommands)) {
        HandleUserCommandsMessage(userCommands);
    }

    return result;
}

// Finds a network message by its protocol id, falling back on its name. The id match is trusted only when the name
// contains nameFragment: the hook parses the message as a concrete protobuf type, and a renumbering by Valve would
// make the id resolve to another message.
static INetworkMessageInternal* FindSvcNetMessage(const char* label, int id, const char* nameFragment) {
    INetworkMessageInternal* message = gNetworkMessages->FindNetworkMessageById(id);
    if (message != NULL) {
        const char* name = message->GetUnscopedName();
        if (name != NULL && strstr(name, nameFragment) != NULL) {
            Log("%s message found by id %d: %s", label, id, name);
            return message;
        }
        Log("%s message id %d resolves to %s, not a %s message", label, id, name != NULL ? name : "(null)",
            nameFragment);
    }

    message = gNetworkMessages->FindNetworkMessagePartial(nameFragment);
    if (message != NULL) {
        Log("%s message found by partial name: %s", label, message->GetUnscopedName());
        return message;
    }

    Log("%s message not found", label);

    return NULL;
}

static INetworkMessageInternal* FindUserCmdsNetMessage() {
    return FindSvcNetMessage("User commands", userCmdsMessageId, "UserCommands");
}

// The name fragment has to leave the client-to-server voice message, CCLCMsg_VoiceData, out.
static INetworkMessageInternal* FindVoiceDataNetMessage() {
    return FindSvcNetMessage("Voice data", voiceDataMessageId, "SVCMsg_VoiceData");
}

static INetworkMessages* GetNetworkMessages() {
    if (gNetworkMessages == NULL) {
        gNetworkMessages =
            (INetworkMessages*)GetLoadedLibInterface(NETWORK_SYSTEM_LIB_NAME, NETWORKMESSAGES_INTERFACE_VERSION);
        if (gNetworkMessages == NULL) {
            Log("Network messages interface not found");
        }
    }

    return gNetworkMessages;
}

void HookNetMessageUnserialize() {
    INetworkMessages* networkMessages = GetNetworkMessages();
    if (networkMessages == NULL) {
        return;
    }

    // The messages may not be registered yet on the first calls, so each is looked up until found.
    if (userCmdsNetMessage == NULL) {
        userCmdsNetMessage = FindUserCmdsNetMessage();
    }
    if (voiceDataNetMessage == NULL) {
        voiceDataNetMessage = FindVoiceDataNetMessage();
    }

    if (originalUnserializeMessageInternal != NULL || (userCmdsNetMessage == NULL && voiceDataNetMessage == NULL)) {
        return;
    }

    auto vtable = *(void***)networkMessages;
    originalUnserializeMessageInternal = (NetMessageUnserializeFn)vtable[unserializeMessageInternalVtableIndex];
    if (!PatchVTableEntry(vtable, unserializeMessageInternalVtableIndex, (void*)&NewUnserializeMessageInternal)) {
        originalUnserializeMessageInternal = NULL;
        Log("Hooking unserialize of network messages failed, the buttons overlay and voice indicator are off");
        return;
    }

    Log("Hooked unserialize of network messages");
}

static INetworkMessageInternal* NewFindOrCreateNetMessage(void* thisptr, int messageId,
                                                          const IProtobufBinding* protoBinding,
                                                          unsigned int messageSize,
                                                          INetworkSerializerBindingBuildFilter* buildFilter,
                                                          bool createIfNotFound, bool autoAssignId) {
    // Reading a demo's message list disallows net message registration, and libmatchmaking registering its messages
    // when playback ends then aborts the game. The engine disallows it again on every serialize/read, so allow it
    // around each call, like the engine does for its own late registrations.
    INetworkMessages* networkMessages = (INetworkMessages*)thisptr;
    bool wasAllowed = networkMessages->IsAdditionalMessageRegistrationAllowed();
    networkMessages->AllowAdditionalMessageRegistration(true);

    INetworkMessageInternal* message = originalFindOrCreateNetMessage(thisptr, messageId, protoBinding, messageSize,
                                                                      buildFilter, createIfNotFound, autoAssignId);

    networkMessages->AllowAdditionalMessageRegistration(wasAllowed);

    return message;
}

void HookFindOrCreateNetMessage() {
    if (originalFindOrCreateNetMessage != NULL) {
        return;
    }

    INetworkMessages* networkMessages = GetNetworkMessages();
    if (networkMessages == NULL) {
        return;
    }

    auto vtable = *(void***)networkMessages;
    originalFindOrCreateNetMessage = (FindOrCreateNetMessageFn)vtable[findOrCreateNetMessageVtableIndex];
    if (!PatchVTableEntry(vtable, findOrCreateNetMessageVtableIndex, (void*)&NewFindOrCreateNetMessage)) {
        originalFindOrCreateNetMessage = NULL;
        Log("Hooking FindOrCreateNetMessage failed, the game may abort when a net message is registered after playback "
            "ends");
        return;
    }

    Log("Hooked FindOrCreateNetMessage");
}

void LogNetMessagesState() {
    Log("Unserialize hook installed: %s, user commands message %s, voice data message %s",
        originalUnserializeMessageInternal != NULL ? "yes" : "no", userCmdsNetMessage != NULL ? "found" : "not found",
        voiceDataNetMessage != NULL ? "found" : "not found");
    Log("FindOrCreateNetMessage hook installed: %s", originalFindOrCreateNetMessage != NULL ? "yes" : "no");
}

#ifdef CSDM_DEV_COMMANDS
void DumpNetworkMessages(int maxId) {
    INetworkMessages* networkMessages = GetNetworkMessages();
    if (networkMessages == NULL) {
        return;
    }

    int count = 0;
    for (int id = 0; id <= maxId; id++) {
        INetworkMessageInternal* message = networkMessages->FindNetworkMessageById(id);
        if (message == NULL) {
            continue;
        }

        Log("Message %d: %s", id, message->GetUnscopedName());
        count++;
    }

    Log("%d network messages registered", count);
}
#endif
