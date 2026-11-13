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
// Slots of INetworkMessages (NetworkMessagesVersion001). The 11/11/2026 CS2 update removed INetworkMessageInternal
// and IProtobufBinding, and three virtuals with them, and moved FindOrCreateNetMessage. The SDK declares that layout
// since, but its UnserializeMessageInternal misses the mode argument, so the plugin keeps calling these slots by index
// instead of through its declaration. Its virtual destructor is declared last, so these indexes are the same on
// Windows and Linux.
//
// The slot owning the instruction that loads the "illegal to register new net messages after serialization" string.
// The CNetMessagePB<T>::GetNetMessage functions call it to register their message.
constexpr int findOrCreateNetMessageVtableIndex = 20;
// The slot owning the instructions that load the "Protobuf parse failed" string. It follows Serialize (2), which ends
// with a jump to SerializeMessageInternal (4).
constexpr int unserializeMessageInternalVtableIndex = 3;
// The second of the two lookups by name that walk the message map (exact at 9, partial at 10), the one comparing
// names with a substring search.
constexpr int findNetworkMessagePartialVtableIndex = 10;
// The pair setting and reading the byte that Serialize and UnserializeFromStream clear.
constexpr int allowAdditionalMessageRegistrationVtableIndex = 22;
constexpr int isAdditionalMessageRegistrationAllowedVtableIndex = 23;
// The lookup walking the message map that compares the message id at 0x18 of each entry.
constexpr int findNetworkMessageByIdVtableIndex = 27;

// svc_UserCmds, the id CSVCMsg_UserCommands is registered under, see SVC_Messages in netmessages.proto.
constexpr int userCmdsMessageId = 76;
// svc_VoiceData, the id CSVCMsg_VoiceData is registered under. Its packets tell who is talking.
constexpr int voiceDataMessageId = 47;

// The NetMessageInfo_t of a message, what the lookups return and CNetMessage::GetNetMessage points to. There is one per
// message, so the pointer identifies the message. Only its first member is read, the name, a CUtlString that holds a
// single char pointer.
struct NetMessageInfo {
    const char* name;
};

// error receives the reason of a failure, the engine passes 4 as mode when it reads a demo. The function keeps both
// the mode (ecx) and error (r8) registers on Linux, the SDK declaration lacks the mode.
typedef bool (*NetMessageUnserializeFn)(void* thisptr, bf_read& buf, CNetMessage* msg, int mode, CUtlString* error);
// allocateMessage returns a new message of the type to register, groupId is a network group id.
typedef NetMessageInfo* (*FindOrCreateNetMessageFn)(void* thisptr, int messageId, CNetMessage* (*allocateMessage)(),
                                                    int groupId, int bufType, bool okayToRedispatch,
                                                    bool cannotBeNetworked);
typedef NetMessageInfo* (*FindNetworkMessagePartialFn)(void* thisptr, const char* partialName);
typedef NetMessageInfo* (*FindNetworkMessageByIdFn)(void* thisptr, int messageId);
typedef void (*AllowAdditionalMessageRegistrationFn)(void* thisptr, bool allow);
typedef bool (*IsAdditionalMessageRegistrationAllowedFn)(void* thisptr);

static void* gNetworkMessages = NULL;
static NetMessageInfo* userCmdsNetMessage = NULL;
static NetMessageInfo* voiceDataNetMessage = NULL;
static NetMessageUnserializeFn originalUnserializeMessageInternal = NULL;
static FindOrCreateNetMessageFn originalFindOrCreateNetMessage = NULL;

template <typename Fn>
static Fn GetNetworkMessagesFunction(void* networkMessages, int index) {
    return (Fn)(*(void***)networkMessages)[index];
}

static const char* GetNetMessageName(const NetMessageInfo* message) {
    return message->name != NULL ? message->name : "(null)";
}

static NetMessageInfo* FindNetworkMessageById(int id) {
    auto find =
        GetNetworkMessagesFunction<FindNetworkMessageByIdFn>(gNetworkMessages, findNetworkMessageByIdVtableIndex);
    return find(gNetworkMessages, id);
}

static NetMessageInfo* FindNetworkMessagePartial(const char* partialName) {
    auto find =
        GetNetworkMessagesFunction<FindNetworkMessagePartialFn>(gNetworkMessages, findNetworkMessagePartialVtableIndex);
    return find(gNetworkMessages, partialName);
}

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

static bool NewUnserializeMessageInternal(void* thisptr, bf_read& buf, CNetMessage* msg, int mode, CUtlString* error) {
    bool result = originalUnserializeMessageInternal(thisptr, buf, msg, mode, error);

    if (!result || msg == NULL) {
        return result;
    }

    const void* netMessage = msg->GetNetMessage();
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
static NetMessageInfo* FindSvcNetMessage(const char* label, int id, const char* nameFragment) {
    NetMessageInfo* message = FindNetworkMessageById(id);
    if (message != NULL) {
        const char* name = GetNetMessageName(message);
        if (strstr(name, nameFragment) != NULL) {
            Log("%s message found by id %d: %s", label, id, name);
            return message;
        }
        Log("%s message id %d resolves to %s, not a %s message", label, id, name, nameFragment);
    }

    message = FindNetworkMessagePartial(nameFragment);
    if (message != NULL) {
        Log("%s message found by partial name: %s", label, GetNetMessageName(message));
        return message;
    }

    Log("%s message not found", label);

    return NULL;
}

static NetMessageInfo* FindUserCmdsNetMessage() {
    return FindSvcNetMessage("User commands", userCmdsMessageId, "UserCommands");
}

// The name fragment has to leave the client-to-server voice message, CCLCMsg_VoiceData, out.
static NetMessageInfo* FindVoiceDataNetMessage() {
    return FindSvcNetMessage("Voice data", voiceDataMessageId, "SVCMsg_VoiceData");
}

static void* GetNetworkMessages() {
    if (gNetworkMessages == NULL) {
        gNetworkMessages = GetLoadedLibInterface(NETWORK_SYSTEM_LIB_NAME, NETWORKMESSAGES_INTERFACE_VERSION);
        if (gNetworkMessages == NULL) {
            Log("Network messages interface not found");
        }
    }

    return gNetworkMessages;
}

void HookNetMessageUnserialize() {
    void* networkMessages = GetNetworkMessages();
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

static NetMessageInfo* NewFindOrCreateNetMessage(void* thisptr, int messageId, CNetMessage* (*allocateMessage)(),
                                                 int groupId, int bufType, bool okayToRedispatch,
                                                 bool cannotBeNetworked) {
    // Reading a demo's message list disallows net message registration, and libmatchmaking registering its messages
    // when playback ends then aborts the game. The engine disallows it again on every serialize/read, so allow it
    // around each call, like the engine does for its own late registrations.
    auto isAllowed = GetNetworkMessagesFunction<IsAdditionalMessageRegistrationAllowedFn>(
        thisptr, isAdditionalMessageRegistrationAllowedVtableIndex);
    auto allow = GetNetworkMessagesFunction<AllowAdditionalMessageRegistrationFn>(
        thisptr, allowAdditionalMessageRegistrationVtableIndex);
    bool wasAllowed = isAllowed(thisptr);
    allow(thisptr, true);

    NetMessageInfo* message = originalFindOrCreateNetMessage(thisptr, messageId, allocateMessage, groupId, bufType,
                                                             okayToRedispatch, cannotBeNetworked);

    allow(thisptr, wasAllowed);

    return message;
}

void HookFindOrCreateNetMessage() {
    if (originalFindOrCreateNetMessage != NULL) {
        return;
    }

    void* networkMessages = GetNetworkMessages();
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
    if (GetNetworkMessages() == NULL) {
        return;
    }

    int count = 0;
    for (int id = 0; id <= maxId; id++) {
        NetMessageInfo* message = FindNetworkMessageById(id);
        if (message == NULL) {
            continue;
        }

        Log("Message %d: %s", id, GetNetMessageName(message));
        count++;
    }

    Log("%d network messages registered", count);
}
#endif
