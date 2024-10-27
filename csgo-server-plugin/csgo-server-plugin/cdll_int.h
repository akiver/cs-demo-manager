#pragma once

class ECommandMsgBoxSlot;

enum CClientFrameStage
{
    FRAME_UNDEFINED = -1,
    FRAME_START,

    FRAME_NET_UPDATE_START,
    FRAME_NET_UPDATE_POSTDATAUPDATE_START,
    FRAME_NET_UPDATE_POSTDATAUPDATE_END,
    FRAME_NET_UPDATE_END,

    FRAME_RENDER_START,
    FRAME_RENDER_END,

    FRAME_NET_FULL_FRAME_UPDATE_ON_REMOVE
};

class IVEngineClient14
{
public:
    virtual void _UNUSED_GetIntersectingSurfaces(void) = 0; // 0
    virtual void _UNUSED_GetLightForPoint(void) = 0; // 1
    virtual void _UNUSED_TraceLineMaterialAndLighting(void) = 0; // 2
    virtual void _UNUSED_ParseFile(void) = 0; // 3
    virtual void _UNUSED_CopyFile(void) = 0; // 4
    virtual void _UNUSED_GetScreenSize(void) = 0; // 5
    virtual void _UNUSED_ServerCmd(void) = 0; // 6
    virtual void _UNUSED_ClientCmd(void) = 0; // 7
    virtual void _UNUSED_GetPlayerInfo(void) = 0; // 8
    virtual void _UNUSED_GetPlayerForUserID(void) = 0; // 9
    virtual void _UNUSED_TextMessageGet(void) = 0; // 10
    virtual void _UNUSED_Con_IsVisible(void) = 0; // 11
    virtual void _UNUSED_GetLocalPlayer(void) = 0; // 12
    virtual void _UNUSED_LoadModel(void) = 0; // 13
    virtual void _UNUSED_GetLastTimeStamp(void) = 0; // 14
    virtual void _UNUSED_GetSentence(void) = 0; // 15
    virtual void _UNUSED_GetSentenceLength(void) = 0; // 16
    virtual void _UNUSED_IsStreaming(void) = 0; // 17
    virtual void _UNUSED_GetViewAngles(void) = 0; // 18
    virtual void _UNUSED_SetViewAngles(void) = 0; // 19
    virtual void _UNUSED_GetMaxClients(void) = 0; // 20
    virtual void _UNUSED_Key_LookupBinding(void) = 0; // 21
    virtual void _UNUSED_Key_BindingForKey(void) = 0; // 22
    virtual void _UNUSED_Key_SetBinding(void) = 0; // 23
    virtual void _UNUSED_StartKeyTrapMode(void) = 0; // 24
    virtual void _UNUSED_CheckDoneKeyTrapping(void) = 0; // 25
    virtual void _UNUSED_IsInGame(void) = 0; // 26
    virtual void _UNUSED_IsConnected(void) = 0; // 27
    virtual void _UNUSED_IsDrawingLoadingImage(void) = 0; // 28
    virtual void _UNUSED_HideLoadingPlaque(void) = 0; // 29
    virtual void _UNUSED_Con_NPrintf(void) = 0; // 30
    virtual void _UNUSED_Con_NXPrintf(void) = 0; // 31
    virtual void _UNUSED_IsBoxVisible(void) = 0; // 32
    virtual void _UNUSED_IsBoxInViewCluster(void) = 0; // 33
    virtual void _UNUSED_CullBox(void) = 0; // 34
    virtual void _UNUSED_Sound_ExtraUpdate(void) = 0; // 35
    virtual const char* GetGameDirectory(void) = 0;
    virtual void _UNUSED_WorldToScreenMatrix(void) = 0; // 37
    virtual void _UNUSED_WorldToViewMatrix(void) = 0; // 38
    virtual void _UNUSED_GameLumpVersion(void) = 0;
    virtual void _UNUSED_GameLumpSize(void) = 0; // 40
    virtual void _UNUSED_LoadGameLump(void) = 0; // 41
    virtual void _UNUSED_LevelLeafCount(void)= 0; // 42
    virtual void _UNUSED_GetBSPTreeQuery(void) = 0; // 43
    virtual void _UNUSED_LinearToGamma(void) = 0; // 44
    virtual void _UNUSED_LightStyleValue(void) = 0; // 45
    virtual void _UNUSED_ComputeDynamicLighting(void) = 0; // 46
    virtual void _UNUSED_GetAmbientLightColor(void) = 0; // 47
    virtual void _UNUSED_GetDXSupportLevel(void) = 0; // 48
    virtual void _UNUSED_SupportsHDR(void) = 0; // 49
    virtual void _UNUSED_Mat_Stub(void) = 0; // 50
    virtual void _UNUSED_GetChapterName(void) = 0; // 51
    virtual void _UNUSED_GetLevelName(void) = 0; // 52
    virtual void _UNUSED_GetLevelNameShort(void) = 0; // 53
    virtual void _UNUSED_GetMapGroupName( void ) = 0; // 54
    virtual void _UNUSED_GetVoiceTweakAPI(void) = 0; // 55
    virtual void _UNUSED_SetVoiceCasterID(void) = 0; // 56
    virtual void _UNUSED_EngineStats_BeginFrame(void) = 0; // 57
    virtual void _UNUSED_EngineStats_EndFrame(void) = 0; // 58
    virtual void _UNUSED_FireEvents(void) = 0; // 59
    virtual void _UNUSED_GetLeavesArea(void) = 0; // 60
    virtual void _UNUSED_DoesBoxTouchAreaFrustum(void) = 0; // 61
    virtual void _UNUSED_GetFrustumList(void) = 0; // 62
    virtual void _UNUSED_ShouldUseAreaFrustum(void) = 0; // 63
    virtual void _UNUSED_SetAudioState(void) = 0; // 64
    virtual void _UNUSED_SentenceGroupPick(void) = 0; // 65
    virtual void _UNUSED_SentenceGroupPickSequential(void) = 0; // 66
    virtual void _UNUSED_SentenceIndexFromName(void) = 0; // 67
    virtual void _UNUSED_SentenceNameFromIndex(void) = 0; // 68
    virtual void _UNUSED_SentenceGroupIndexFromName(void) = 0; // 69
    virtual void _UNUSED_SentenceGroupNameFromIndex(void) = 0; // 70
    virtual void _UNUSED_SentenceLength(void) = 0; // 71
    virtual void _UNUSED_ComputeLighting(void) = 0; // 72
    virtual void _UNUSED_ActivateOccluder(void) = 0; // 73
    virtual void _UNUSED_IsOccluded(void) = 0; // 74
    virtual void _UNUSED_GetOcclusionViewId(void) = 0; // 75
    virtual void _UNUSED_SaveAllocMemory(void) = 0; // 76
    virtual void _UNUSED_SaveFreeMemory(void) = 0; // 77
    virtual void _UNUSED_GetNetChannelInfo(void) = 0; // 78
    virtual void _UNUSED_DebugDrawPhysCollide(void) = 0; // 79
    virtual void _UNUSED_CheckPoint(void) = 0; // 80
    virtual void _UNUSED_DrawPortals(void) = 0; // 81
    virtual bool IsPlayingDemo(void) = 0;
    virtual void _UNUSED_IsRecordingDemo(void) = 0; // 83
    virtual void _UNUSED_IsPlayingTimeDemo(void) = 0; // 84
    virtual void _UNUSED_GetDemoRecordingTick(void) = 0; // 85
    virtual int GetDemoPlaybackTick(void) = 0; // 86
    virtual void _UNUSED_GetDemoPlaybackStartTick(void) = 0; // 87
    virtual void _UNUSED_GetDemoPlaybackTimeScale(void) = 0; // 88
    virtual void _UNUSED_GetDemoPlaybackTotalTicks(void) = 0; // 89
    virtual void _UNUSED_IsPaused(void) = 0; // 90
    virtual void _UNUSED_GetTimescale(void) = 0; // 91
    virtual void _UNUSED_IsTakingScreenshot(void) = 0; // 92
    virtual void _UNUSED_IsHLTV(void) = 0; // 93
    virtual void _UNUSED_IsLevelMainMenuBackground(void) = 0; // 94
    virtual void _UNUSED_GetMainMenuBackgroundName(void) = 0; // 95
    virtual void _UNUSED_SetOcclusionParameters(void) = 0; // 96
    virtual void _UNUSED_GetUILanguage(void) = 0; // 97
    virtual void _UNUSED_IsSkyboxVisibleFromPoint(void) = 0; // 98
    virtual void _UNUSED_GetMapEntitiesString(void) = 0; // 99
    virtual void _UNUSED_IsInEditMode(void) = 0; // 100
    virtual void _UNUSED_GetScreenAspectRatio(void) = 0; // 101
    virtual void _UNUSED_REMOVED_SteamRefreshLogin(void) = 0; // 102
    virtual void _UNUSED_REMOVED_SteamProcessCall(void) = 0; // 103
    virtual void _UNUSED_GetEngineBuildNumber(void) = 0; // 104
    virtual void _UNUSED_GetProductVersionString(void) = 0; // 105
    virtual void _UNUSED_GrabPreColorCorrectedFrame(void) = 0; // 106
    virtual void _UNUSED_IsHammerRunning(void) = 0; // 107
    virtual void ExecuteClientCmd(const char* szCmdString) = 0; // 108
    virtual void _UNUSED_MapHasHDRLighting(void) = 0; // 109
    virtual void _UNUSED_GetAppID(void) = 0; // 110
    virtual void _UNUSED_GetLightForPointFast(void) = 0; // 111
    virtual void _UNUSED_ClientCmd_Unrestricted(void) = 0; // 112

    // ...some more unused functions
};
