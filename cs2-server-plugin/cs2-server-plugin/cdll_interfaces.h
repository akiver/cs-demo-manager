#pragma once

//===== Copyright 1996-2005, Valve Corporation, All rights reserved. ======//
//
// Purpose: Interfaces between the client.dll and engine
//
//===========================================================================//

// Credits @dtugend https://github.com/advancedfx/advancedfx-prop/blob/prop/cs2/sdk_src/public/cdll_int.h
#include "interface.h"

class KeyValues;

abstract_class IDemoPlayer
{
public:
    virtual void _Unknown_000(void) = 0;
    virtual void _Unknown_001(void) = 0;
    // The Itanium ABI gives the virtual destructor two vtable slots where MSVC uses one, so every slot from here on
    // is one later on Linux than on Windows. The :xxx comments are the Windows slots; add 1 for Linux.
#if !defined(_WIN32)
    virtual void* _Unknown_Linux_002(void) = 0;
#endif
    virtual int GetDemoStartTick(void) = 0; //:002 returns the engine tick at which demo playback started
    virtual int GetDemoTick(void) = 0; //:003
    // Byte-identical to GetDemoTick on Linux; MSVC's linker folds the two, which is why on Windows this slot and the
    // previous one point to the same function.
    virtual int _Unknown_004(void) = 0;
    // This comes from the CDemoFileInfo message located at the end of .dem files.
    // Its offset is stored in the demo header as an int32 right after the "PBDEMS2" magic,
    // followed by another int32 holding the offset of the DEM_Stop message.
    // When a demo is corrupted, it returns 0.
    virtual int GetTotalDemoTicks(void) = 0; //:005
    virtual float TicksToTime(int nTicks) = 0; //:006 converts a tick to seconds by multiplying by the tick interval (1/64)
    // pOptions (may be NULL) holds playback options as command-line style flags.
    // The only flag the engine reads is "--startmovie": when present, a quoted `startmovie "<args>"` console command
    // is queued as soon as playback starts.
    virtual bool PlayDemo(const char* pszFilename, KeyValues* pOptions) = 0; //:007
    virtual void _Unknown_008(void) = 0; //:008 PlayDemo variant with 3 params which seems called by PlayDemo.
    virtual bool IsPlayingBack(void) = 0; //:009 true once the first demo packet has been read (i.e. data is flowing).
    virtual KeyValues* GetPlaybackOptions(void) = 0; //:010
    // True from the moment playback starts until it stops, pause included. Unlike IsPlayingBack it doesn't wait for
    // the first packet, so it is already true while the demo loads.
    virtual bool IsPlaybackActive(void) = 0; //:011
    // True when:
    // - playback is active
    // - at least one demo packet has been read
    // - no SkipToTick is in flight
    // - the pause flag toggled by PausePlayback/ResumePlayback is set
    virtual bool IsPlaybackPaused(void) = 0; //:012
    virtual bool IsPlayingTimeDemo(void) = 0; //:013 true when playing a demo with the `timedemo` command.
    virtual bool IsSkipping(void) = 0; //:014
    virtual bool _Unknown_015(void) = 0; //:015 Always returns 0
    virtual void SetPlaybackTimeScale(float timeScale) = 0; //:016
    virtual float GetPlaybackTimeScale(void) = 0; //:017
    virtual void PausePlayback(float seconds) = 0; //:018
    virtual void SkipToTick(int tick, bool bRelative) = 0; //:019
    virtual void ResumePlayback(void) = 0; //:020
    virtual void StopPlayback(void) = 0; //:021
};


abstract_class ISource2EngineToClient
{
public:
    virtual void _Unknown_000(void) = 0;
    virtual void _Unknown_001(void) = 0;
    virtual void _Unknown_002(void) = 0;
    virtual void _Unknown_003(void) = 0;
    virtual void _Unknown_004(void) = 0;
    virtual void _Unknown_005(void) = 0;
    virtual void _Unknown_006(void) = 0;
    virtual void _Unknown_007(void) = 0;
    virtual void _Unknown_008(void) = 0;
    virtual void _Unknown_009(void) = 0;
    virtual void _Unknown_010(void) = 0;
    virtual void _Unknown_011(void) = 0;
    virtual void _Unknown_012(void) = 0;
    virtual void _Unknown_013(void) = 0;
    virtual void _Unknown_014(void) = 0;
    virtual void _Unknown_015(void) = 0;
    virtual void _Unknown_016(void) = 0;
    virtual void _Unknown_017(void) = 0;
    virtual void _Unknown_018(void) = 0;
    virtual void _Unknown_019(void) = 0;
    virtual void _Unknown_020(void) = 0;
    virtual void _Unknown_021(void) = 0;
    virtual void _Unknown_022(void) = 0;
    virtual void _Unknown_023(void) = 0;
    virtual void _Unknown_024(void) = 0;
    virtual void _Unknown_025(void) = 0;
    virtual void _Unknown_026(void) = 0;
    virtual void _Unknown_027(void) = 0;
    virtual void _Unknown_028(void) = 0;
    virtual void _Unknown_029(void) = 0;
    virtual void _Unknown_030(void) = 0;
    virtual void _Unknown_031(void) = 0;
    virtual void _Unknown_032(void) = 0;
    virtual void _Unknown_033(void) = 0;
    virtual void _Unknown_034(void) = 0;
    virtual void _Unknown_035(void) = 0;
    virtual void _Unknown_036(void) = 0;
    virtual int GetMaxClients(void) = 0; //:037
    virtual bool IsInGame(void) = 0; //:038
    virtual bool IsConnected(void) = 0; //:039
    virtual void _Unknown_040(void) = 0;
    virtual void _Unknown_041(void) = 0;
    virtual bool IsPlayingDemo(void) = 0; //:042
    virtual const char* GetDemoFilePath(void) = 0; //:043
    virtual bool IsRecordingDemo(void) = 0; //:044
    virtual void _Unknown_045(void) = 0; // Demo related
    virtual void _Unknown_046(void) = 0;
    virtual void _Unknown_047(void) = 0;
    virtual void _Unknown_048(void) = 0;
    virtual void _Unknown_049(void) = 0;
    virtual void _Unknown_050(void) = 0;
    virtual void ExecuteClientCmd(int iUnk0MaybeSplitScreenSlotSetTo0, const char* pszCommands, bool bUnk2SetToTrue) = 0; //:051
    virtual void _Unknown_052(void) = 0;
    virtual void _Unknown_053(void) = 0;
    virtual void _Unknown_054(void) = 0;
    virtual void _Unknown_055(void) = 0;
    virtual void _Unknown_056(void) = 0;
    virtual void _Unknown_057(void) = 0;
    virtual void _Unknown_058(void) = 0;
    virtual void _Unknown_059(void) = 0;
    virtual void _Unknown_060(void) = 0;
    virtual void GetScreenSize(int& width, int& height) = 0; //:061
    virtual void _Unknown_062(void) = 0;
    virtual void _Unknown_063(void) = 0;
    virtual char const* GetLevelName(void) = 0; //:064
    virtual char const* GetLevelNameShort(void) = 0; //:065
    virtual void _Unknown_066(void) = 0;
    virtual void _Unknown_067(void) = 0;
    virtual void _Unknown_068(void) = 0;
    virtual IDemoPlayer* GetDemoPlayer(void) = 0; //:069
};

enum class ClientFrameStage_t : int
{
    // (haven't run any frames yet)
    FRAME_UNDEFINED = -1,
    FRAME_START = 0,
    // A network packet is being recieved
    FRAME_NET_UPDATE_START,
    // Data has been received and we're going to start calling PostDataUpdate
    FRAME_NET_UPDATE_POSTDATAUPDATE_START,
    // Data has been received and we've called PostDataUpdate on all data recipients
    FRAME_NET_UPDATE_POSTDATAUPDATE_END,
    // We've received all packets, we can now do interpolation, prediction, etc..
    FRAME_NET_UPDATE_END,
    // We're about to start rendering the scene
    FRAME_RENDER_START,
    // We've finished rendering the scene.
    FRAME_RENDER_END
};


abstract_class ISource2Client
{
public:
    virtual void _Unknown_000(void) = 0;
    virtual void _Unknown_001(void) = 0;
    virtual void _Unknown_002(void) = 0;
    virtual void _Unknown_003(void) = 0;
    virtual void _Unknown_004(void) = 0;
    virtual void _Unknown_005(void) = 0;
    virtual void _Unknown_006(void) = 0;
    virtual void _Unknown_007(void) = 0;
    virtual void _Unknown_008(void) = 0;
    virtual void _Unknown_009(void) = 0;
    virtual void _Unknown_010(void) = 0;
    virtual void _Unknown_011(void) = 0;
    virtual void _Unknown_012(void) = 0;
    virtual void _Unknown_013(void) = 0;
    virtual void _Unknown_014(void) = 0;
    virtual void _Unknown_015(void) = 0;
    virtual void _Unknown_016(void) = 0;
    virtual void _Unknown_017(void) = 0;
    virtual void _Unknown_018(void) = 0;
    virtual void _Unknown_019(void) = 0;
    virtual void _Unknown_020(void) = 0;
    virtual void _Unknown_021(void) = 0;
    virtual void _Unknown_022(void) = 0;
    virtual void _Unknown_023(void) = 0;
    virtual void _Unknown_024(void) = 0;
    virtual void _Unknown_025(void) = 0;
    virtual void _Unknown_026(void) = 0;
    virtual void _Unknown_027(void) = 0;
    virtual void _Unknown_028(void) = 0;
    virtual void _Unknown_029(void) = 0;
    virtual void _Unknown_030(void) = 0;
    virtual void _Unknown_031(void) = 0;
    virtual void _Unknown_032(void) = 0;
    virtual void _Unknown_033(void) = 0;
    virtual void _Unknown_034(void) = 0;
    virtual void _Unknown_035(void) = 0;
    virtual void FrameStageNotify(ClientFrameStage_t curStage);
};
