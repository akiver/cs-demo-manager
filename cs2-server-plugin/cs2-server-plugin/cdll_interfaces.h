//===== Copyright 1996-2005, Valve Corporation, All rights reserved. ======//
//
// Purpose: Interfaces between the client.dll and engine
//
//===========================================================================//

// Credits @dtugend https://github.com/advancedfx/advancedfx-prop/blob/prop/cs2/sdk_src/public/cdll_int.h
#include "interface.h"

abstract_class IDemoFile
{
public:
    virtual void _Unknown_000(void) = 0;
    virtual void _Unknown_001(void) = 0;

    virtual int GetDemoStartTick(void) = 0; //:002

#if defined _WIN32
    virtual int _Unknown_003(void) = 0;
    virtual int GetDemoTick(void) = 0; //:004
    virtual void _Unknown_005(void) = 0;
    virtual void _Unknown_006(void) = 0;
#else
    virtual void _Unknown_003(void) = 0;
    virtual void _Unknown_004(void) = 0;
    virtual void _Unknown_005(void) = 0;
    virtual int GetDemoTick(void) = 0; //:006
#endif

    virtual int _Unknown_007(void) = 0;
    virtual int _Unknown_008(void) = 0;
    virtual int _Unknown_009(void) = 0;
    virtual int _Unknown_010(void) = 0;
    virtual int _Unknown_011(void) = 0;
    virtual bool IsPlayingDemo(void) = 0; //:012
    virtual bool IsDemoPaused(void) = 0; //:013

    virtual int _Unknown_014(void) = 0;
    virtual int _Unknown_015(void) = 0;
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
    virtual void _Unknown_037(void) = 0;
    virtual void _Unknown_038(void) = 0;
    virtual void _Unknown_039(void) = 0;

    virtual bool IsPlayingDemo(void) = 0; //:040

    virtual void _Unknown_041(void) = 0;
    virtual void _Unknown_042(void) = 0;
    virtual void _Unknown_043(void) = 0;
    virtual void _Unknown_044(void) = 0;
    virtual void _Unknown_045(void) = 0;
    virtual void _Unknown_046(void) = 0;
    virtual void _Unknown_047(void) = 0;

    virtual void ExecuteClientCmd(int iUnk0MaybeSplitScreenSlotSetTo0, const char* pszCommands, bool bUnk2SetToTrue) = 0; //:048

    virtual void _Unknown_049(void) = 0;
    virtual void _Unknown_050(void) = 0;
    virtual void _Unknown_051(void) = 0;
    virtual void _Unknown_052(void) = 0;
    virtual void _Unknown_053(void) = 0;
    virtual void _Unknown_054(void) = 0;
    virtual void _Unknown_055(void) = 0;
    virtual void _Unknown_056(void) = 0;
    virtual void _Unknown_057(void) = 0;
    virtual void _Unknown_058(void) = 0;
    virtual void _Unknown_059(void) = 0;
    virtual void _Unknown_060(void) = 0;

    virtual char const* GetLevelName(void) = 0; //:061
    virtual char const* GetLevelNameShort(void) = 0; //:062

    virtual void _Unknown_063(void) = 0;
    virtual void _Unknown_064(void) = 0;
    virtual void _Unknown_065(void) = 0;

    virtual IDemoFile* GetDemoFile(void) = 0; //:066
};

enum ClientFrameStage_t
{
    FRAME_UNDEFINED = -1,			// (haven't run any frames yet)
    FRAME_START,

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
