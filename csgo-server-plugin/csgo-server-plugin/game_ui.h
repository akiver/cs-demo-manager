#pragma once

enum CSGOGameUIState_t
{
    CSGO_GAME_UI_STATE_INVALID = 0,
    CSGO_GAME_UI_STATE_LOADINGSCREEN,
    CSGO_GAME_UI_STATE_INGAME,
    CSGO_GAME_UI_STATE_MAINMENU,
    CSGO_GAME_UI_STATE_PAUSEMENU,
    CSGO_GAME_UI_STATE_INTROMOVIE,
};

class CGameUI {
private:
#ifdef _WIN32
    BYTE gap0[484];
#else
    BYTE gap0[512];
#endif
public:
    CSGOGameUIState_t m_CSGOGameUIState;
};
