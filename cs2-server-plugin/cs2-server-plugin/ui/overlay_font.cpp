#include "overlay_font.h"

#include <cstdio>

#include "imgui.h"
#ifdef _WIN32
#include <windows.h>
#endif

// Merged in this order, each file filling in what the ones before it don't cover. Only two of the six CJK files the
// game ships are taken: a file is read whole into memory, while glyphs are rasterized only when drawn.
static const char* const gameFontPaths[] = {
    "/csgo/panorama/fonts/notosans-regular.ttf",         // Latin, Greek and Cyrillic.
    "/csgo/panorama/fonts/notosanssymbols-regular.ttf",  // Symbols and arrows.
    "/csgo/panorama/fonts/notosansthai-regular.ttf",     // Thai.
    "/csgo/panorama/fonts/notosanssc-regular.ttf",       // Chinese ideographs and Japanese kana.
    "/csgo/panorama/fonts/notosanskr-regular.ttf",       // Hangul.
};

#ifndef _WIN32
static const char* const emojiFontPaths[] = {
    "/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf",
    "/usr/share/fonts/noto/NotoEmoji-Regular.ttf",
    "/usr/share/fonts/google-noto-emoji/NotoEmoji-Regular.ttf",
};
#endif

static bool AddFont(const char* path, bool* isFontLoaded) {
    // ImGui asserts when it can't read a font file, and an assert aborts the game so ensure the file exists before
    // trying to load it.
    FILE* file = fopen(path, "rb");
    if (file == NULL) {
        return false;
    }
    fclose(file);

    ImFontConfig config;
    config.MergeMode = *isFontLoaded;
    // The size is 0 because the panels set theirs with PushFont, scaled to the resolution of the game.
    if (ImGui::GetIO().Fonts->AddFontFromFileTTF(path, 0.f, &config) == NULL) {
        return false;
    }

    *isFontLoaded = true;

    return true;
}

// No font of the game has emoji, so they come from the system.
static void AddEmojiFont(bool* isFontLoaded) {
#ifdef _WIN32
    // Segoe UI Symbol. Segoe UI Emoji next to it is a color font.
    char windowsDirectory[MAX_PATH];
    if (GetWindowsDirectoryA(windowsDirectory, MAX_PATH) == 0) {
        return;
    }

    char path[MAX_PATH];
    if (snprintf(path, sizeof(path), "%s/Fonts/seguisym.ttf", windowsDirectory) < (int)sizeof(path)) {
        AddFont(path, isFontLoaded);
    }
#else
    for (const char* path : emojiFontPaths) {
        if (AddFont(path, isFontLoaded)) {
            return;
        }
    }
#endif
}

bool LoadOverlayFont(const char* gameDirectory) {
    bool isFontLoaded = false;
    if (gameDirectory != NULL && gameDirectory[0] != '\0') {
        for (const char* fontPath : gameFontPaths) {
            char path[1024];
            if (snprintf(path, sizeof(path), "%s%s", gameDirectory, fontPath) < (int)sizeof(path)) {
                AddFont(path, &isFontLoaded);
            }
        }
    }

    // Last, so the fonts of the game win the characters they have.
    AddEmojiFont(&isFontLoaded);

    return isFontLoaded;
}
