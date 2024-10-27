#pragma once
#include <edict.h>
#include <interface.h>
#include <engine/iserverplugin.h>

class CServerPlugin : public IServerPluginCallbacks
{
public:
    CServerPlugin();
    ~CServerPlugin();

public:
    virtual bool Load(CreateInterfaceFn interfaceFactory, CreateInterfaceFn gameServerFactory);
    virtual void Unload();
    virtual void Pause() {};
    virtual void UnPause() {};
    virtual const char* GetPluginDescription(void);
    virtual void LevelInit(const char* pMapName) {};
    virtual void ServerActivate(edict_t* pEdictList, int edictCount, int clientMax) {};
    virtual void GameFrame(bool simulating) {};
    virtual void LevelShutdown() {};
    virtual void ClientActive(edict_t* pEntity) {};
    virtual void ClientFullyConnect(edict_t* pEntity) {};
    virtual void ClientDisconnect(edict_t* pEntity) {};
    virtual void ClientPutInServer(edict_t* pEntity, const char* playername) {};
    virtual void SetCommandClient(int index) {};
    virtual void ClientSettingsChanged(edict_t* pEdict) {};
    virtual PLUGIN_RESULT ClientConnect(bool* bAllowConnect, edict_t* pEntity, const char* pszName, const char* pszAddress, char* reject, int maxrejectlen) { return PLUGIN_CONTINUE; }
    virtual PLUGIN_RESULT ClientCommand(edict_t* pEntity, const CCommand& args) { return PLUGIN_CONTINUE; }
    virtual PLUGIN_RESULT NetworkIDValidated(const char* pszUserName, const char* pszNetworkID) { return PLUGIN_CONTINUE; }
    virtual void OnQueryCvarValueFinished(QueryCvarCookie_t iCookie, edict_t* pPlayerEntity, EQueryCvarValueStatus eStatus, const char* pCvarName, const char* pCvarValue) {};
    virtual void OnEdictAllocated(edict_t* edict) {};
    virtual void OnEdictFreed(const edict_t* edict) {};
    virtual bool BNetworkCryptKeyCheckRequired(uint32 unFromIP, uint16 usFromPort, uint32 unAccountIdProvidedByClient, bool bClientWantsToUseCryptKey) { return false; };
    virtual bool BNetworkCryptKeyValidate(uint32 unFromIP, uint16 usFromPort, uint32 unAccountIdProvidedByClient, int nEncryptionKeyIndexFromClient, int numEncryptedBytesFromClient, byte* pbEncryptedBufferFromClient, byte* pbPlainTextKeyForNetchan) { return false; };
};
