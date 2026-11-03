#pragma once

#include "imgui.h"

// A play triangle while paused, two pause bars while playing.
void DrawPlayPauseIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isPaused);
void DrawStopIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size);
void DrawCameraIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size);
void DrawMicrophoneIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size);
void DrawGearIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size);

// The kill markers of the timelines, a ring for a kill and a cross for a death, around `center`.
void DrawKillIcon(ImDrawList* drawList, ImVec2 center, float halfSize, float thickness, ImU32 color);
void DrawDeathIcon(ImDrawList* drawList, ImVec2 center, float halfSize, float thickness, ImU32 color);

// The arrows, pointing left for the previous one and right for the next: at a bar for a round, at a target ring for a
// kill, at a star for a highlight, away from a bar for a frame, and a bare chevron for a player.
void DrawSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color);
void DrawKillSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color);
void DrawHighlightSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color);
void DrawFrameStepIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color);
void DrawChevronIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color);
// Two arcs chasing each other, each ending with an arrowhead.
void DrawLoopIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, ImU32 color);
// A record dot in a ring, the dot becoming a stop square when `isStopping` is true.
void DrawRecordIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isStopping, ImU32 color);
// A padlock, its shackle lifted open while `isLocked` is false.
void DrawLockIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isLocked, ImU32 color);
