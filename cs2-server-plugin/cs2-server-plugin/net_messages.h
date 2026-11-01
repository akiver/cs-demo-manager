#pragma once

// Everything here runs on the game thread, where the engine unserializes the messages of a demo, so nothing needs a
// lock.

void HookNetMessageUnserialize();

// Hooks net message registration so it doesn't abort the game once a demo playback disallowed it, see
// NewFindOrCreateNetMessage. Must be called on the game thread.
void HookFindOrCreateNetMessage();

void LogNetMessagesState();

#ifdef CSDM_DEV_COMMANDS
// Logs the id and name of every network message registered in the client, up to maxId.
void DumpNetworkMessages(int maxId);
#endif
