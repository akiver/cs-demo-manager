using System;

namespace DemoInfo.Messages
{
	#if !SLOW_PROTOBUF
	public enum NET_Messages
	{
		net_NOP = 0,
		net_Disconnect = 1,
		net_File = 2,
		net_SplitScreenUser = 3,
		net_Tick = 4,
		net_StringCmd = 5,
		net_SetConVar = 6,
		net_SignonState = 7
	}

	public enum SVC_Messages
	{
		svc_ServerInfo = 8,
		svc_SendTable = 9,
		svc_ClassInfo = 10,
		svc_SetPause = 11,
		svc_CreateStringTable = 12,
		svc_UpdateStringTable = 13,
		svc_VoiceInit = 14,
		svc_VoiceData = 15,
		svc_Print = 16,
		svc_Sounds = 17,
		svc_SetView = 18,
		svc_FixAngle = 19,
		svc_CrosshairAngle = 20,
		svc_BSPDecal = 21,
		svc_SplitScreen = 22,
		svc_UserMessage = 23,
		svc_EntityMessage = 24,
		svc_GameEvent = 25,
		svc_PacketEntities = 26,
		svc_TempEntities = 27,
		svc_Prefetch = 28,
		svc_Menu = 29,
		svc_GameEventList = 30,
		svc_GetCvarValue = 31,
		svc_PaintmapData = 33,
		svc_CmdKeyValues = 34,
		svc_EncryptedData = 35
	}
	#endif
}

