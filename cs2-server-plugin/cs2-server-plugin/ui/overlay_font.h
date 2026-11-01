#pragma once

// ImGui's default font only covers Latin. The fonts of the game cover the rest.
// Loads the fonts into the current ImGui context, which has to exist and have none yet. False leaves ImGui's default
// font in place.
bool LoadOverlayFont(const char* gameDirectory);
