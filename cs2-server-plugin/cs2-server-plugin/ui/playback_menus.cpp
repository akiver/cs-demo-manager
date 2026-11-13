#include "playback_menus.h"

#include <algorithm>
#include <cstdio>

#include "imgui_internal.h"
#include "overlay_palette.h"
#include "playback_state.h"
#include "playback_widgets.h"

constexpr const char* voiceMenuGroupLabels[voiceMenuGroupCount] = {"COUNTER-TERRORISTS", "TERRORISTS", "OTHERS"};
constexpr OverlayColor voiceMenuTeamColors[voiceMenuOthersGroup] = {overlayCounterTerroristColor,
                                                                    overlayTerroristColor};

static void DrawVoiceMenuGroupLabel(int group) {
    if (group == voiceMenuOthersGroup) {
        ImGui::TextDisabled("%s", voiceMenuGroupLabels[group]);
        return;
    }

    // The CT and T labels follow a dot of the team color.
    float lineHeight = ImGui::GetTextLineHeight();
    float radius = lineHeight * 0.22f;
    float dotStart = ImGui::GetCursorScreenPos().x;
    ImGui::SetCursorPosX(ImGui::GetCursorPosX() + radius * 2.f + ImGui::GetStyle().ItemInnerSpacing.x);
    ImGui::TextDisabled("%s", voiceMenuGroupLabels[group]);
    // The label's rect is the text itself, which AlignTextToFramePadding may have lowered.
    float centerY = ImGui::GetItemRectMin().y + lineHeight * 0.5f;
    ImGui::GetWindowDrawList()->AddCircleFilled(ImVec2(dotStart + radius, centerY), radius,
                                                voiceMenuTeamColors[group].ToU32(), 16);
}

static void DrawVoiceGroupHeader(const PlaybackPanelState& state, PlaybackPanelActions& actions, int group,
                                 uint32_t groupLow, uint32_t groupHigh) {
    float spacing = ImGui::GetStyle().ItemSpacing.x;
    // Both buttons have the same width so the buttons of every group line up.
    float buttonWidth = GetButtonWidth("NONE");
    float rowStart = ImGui::GetCursorPosX();
    float rowWidth = ImGui::GetContentRegionAvail().x;
    bool areAllEnabled = (state.voiceMaskLow & groupLow) == groupLow && (state.voiceMaskHigh & groupHigh) == groupHigh;
    bool areNoneEnabled = (state.voiceMaskLow & groupLow) == 0 && (state.voiceMaskHigh & groupHigh) == 0;

    ImGui::AlignTextToFramePadding();
    DrawVoiceMenuGroupLabel(group);
    if (group == voiceMenuOthersGroup) {
        return;
    }
    // The buttons sit at the right edge of the menu, or right after a label too long for that. The menu sizes itself
    // to its content, so it widens on the next frame and the row then fits.
    float labelEnd = ImGui::GetItemRectMax().x - ImGui::GetWindowPos().x + ImGui::GetScrollX();
    float buttonsStart = rowStart + rowWidth - buttonWidth * 2.f - spacing;
    if (buttonsStart < labelEnd + spacing) {
        buttonsStart = labelEnd + spacing;
    }
    ImGui::SameLine(buttonsStart, 0.f);
    if (ToggleButton("ALL", areAllEnabled, ImVec2(buttonWidth, 0.f))) {
        AddVoiceMaskAction(actions, state.voiceMaskLow | groupLow, state.voiceMaskHigh | groupHigh);
    }
    ImGui::SameLine();
    if (ToggleButton("NONE", areNoneEnabled, ImVec2(buttonWidth, 0.f))) {
        AddVoiceMaskAction(actions, state.voiceMaskLow & ~groupLow, state.voiceMaskHigh & ~groupHigh);
    }
}

static void DrawVoiceList(const PlaybackPanelState& state, PlaybackPanelActions& actions, float scale) {
    float spacing = ImGui::GetStyle().ItemSpacing.x;
    int playerCount = std::clamp(state.playerCount, 0, playbackMaxPlayers);
    bool areAllEnabled = playerCount > 0;
    bool areNoneEnabled = playerCount > 0;
    for (int i = 0; i < playerCount; i++) {
        if (IsVoiceSlotEnabled(state.voiceMaskLow, state.voiceMaskHigh, state.players[i].slot)) {
            areNoneEnabled = false;
        } else {
            areAllEnabled = false;
        }
    }

    float buttonHeight = 28.f * scale;
    float buttonWidth = (ImGui::GetContentRegionAvail().x - spacing) * 0.5f;
    if (ToggleButton("ALL", areAllEnabled, ImVec2(buttonWidth, buttonHeight))) {
        AddVoiceMaskAction(actions, UINT32_MAX, UINT32_MAX);
    }
    ImGui::SameLine();
    if (ToggleButton("NONE", areNoneEnabled, ImVec2(buttonWidth, buttonHeight))) {
        AddVoiceMaskAction(actions, 0, 0);
    }

    if (playerCount == 0) {
        ImGui::Spacing();
        ImGui::TextDisabled("No players");
    }

    for (int group = 0; group < voiceMenuGroupCount; group++) {
        uint32_t groupLow = 0;
        uint32_t groupHigh = 0;
        for (int i = 0; i < playerCount; i++) {
            const PlaybackPlayer& player = state.players[i];
            if (!IsPlayerInVoiceMenuGroup(player, group)) {
                continue;
            }

            uint32_t bitLow;
            uint32_t bitHigh;
            GetVoiceSlotBit(player.slot, &bitLow, &bitHigh);
            groupLow |= bitLow;
            groupHigh |= bitHigh;
        }

        if (groupLow == 0 && groupHigh == 0) {
            continue;
        }

        ImGui::PushID(group);
        ImGui::Spacing();
        DrawVoiceGroupHeader(state, actions, group, groupLow, groupHigh);

        for (int i = 0; i < playerCount; i++) {
            const PlaybackPlayer& player = state.players[i];
            if (!IsPlayerInVoiceMenuGroup(player, group)) {
                continue;
            }

            bool isEnabled = IsVoiceSlotEnabled(state.voiceMaskLow, state.voiceMaskHigh, player.slot);
            ImGui::PushID(player.slot);
            if (ImGui::Checkbox(player.name, &isEnabled)) {
                uint32_t bitLow;
                uint32_t bitHigh;
                GetVoiceSlotBit(player.slot, &bitLow, &bitHigh);
                AddVoiceMaskAction(actions, state.voiceMaskLow ^ bitLow, state.voiceMaskHigh ^ bitHigh);
            }
            ImGui::PopID();
        }
        ImGui::PopID();
    }
}

void DrawVoiceMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor, ImVec2 panelPosition,
                   ImVec2 panelSize, ImVec2 displaySize, float scale) {
    bool isOpen = BeginPanelMenu("voice", anchor, panelPosition, panelSize, displaySize, scale);
    if (isOpen) {
        bool isVoiceIndicatorVisible = state.isVoiceIndicatorVisible;
        if (ImGui::Checkbox("Show who is talking", &isVoiceIndicatorVisible)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_VOICE_INDICATOR));
        }

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();
        DrawVoiceList(state, actions, scale);
    }
    EndPanelMenu(isOpen);
}

void DrawCamerasMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                     ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale) {
    bool isOpen = BeginPanelMenu("cameras", anchor, panelPosition, panelSize, displaySize, scale);
    if (isOpen) {
        if (ImGui::Button("Back to players", ImVec2(ImGui::GetContentRegionAvail().x, 28.f * scale))) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_SPECTATE_PLAYERS));
        }

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();

        int cameraCount = state.cameraCount < 0
                              ? 0
                              : (state.cameraCount > playbackMaxCameras ? playbackMaxCameras : state.cameraCount);
        if (cameraCount == 0) {
            ImGui::TextDisabled("No cameras for this map");
            ImGui::TextDisabled("Add some from the CS:DM settings");
        }

        // The current camera is lit like the toggle buttons.
        ImGui::PushStyleColor(ImGuiCol_Header, overlayActiveColor.ToVec4());
        ImGui::PushStyleColor(ImGuiCol_HeaderHovered, overlayHoveredColor.ToVec4());
        ImGui::PushStyleColor(ImGuiCol_HeaderActive, overlayPressedColor.ToVec4());
        float swatchSize = ImGui::GetFontSize() * 0.7f;
        for (int i = 0; i < cameraCount; i++) {
            const PlaybackCamera& camera = state.cameras[i];
            // Numbered as the csdm_camera command expects them.
            char label[playbackCameraNameSize + 16];
            snprintf(label, sizeof(label), "%d. %s", i + 1, camera.name);
            ImGui::PushID(i);
            // The swatch is drawn in the selectable's left padding so a camera without a color stays aligned.
            ImVec2 position = ImGui::GetCursorScreenPos();
            ImGui::SetCursorPosX(ImGui::GetCursorPosX() + swatchSize + ImGui::GetStyle().ItemSpacing.x);
            // The menu stays open to hop from one camera to another.
            if (ImGui::Selectable(label, i == state.currentCameraIndex, ImGuiSelectableFlags_NoAutoClosePopups)) {
                PlaybackAction action = MakeAction(PLAYBACK_ACTION_GOTO_CAMERA);
                action.cameraIndex = i;
                AddAction(actions, action);
            }
            if (camera.color != 0) {
                float swatchTop = position.y + (ImGui::GetItemRectSize().y - swatchSize) * 0.5f;
                ImGui::GetWindowDrawList()->AddRectFilled(ImVec2(position.x, swatchTop),
                                                          ImVec2(position.x + swatchSize, swatchTop + swatchSize),
                                                          camera.color, swatchSize * 0.2f);
            }
            ImGui::PopID();
        }
        ImGui::PopStyleColor(3);
    }
    EndPanelMenu(isOpen);
}

void DrawPlayersMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                     ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale) {
    bool isOpen = BeginPanelMenu("players", anchor, panelPosition, panelSize, displaySize, scale);
    if (isOpen) {
        int playerCount = std::clamp(state.playerCount, 0, playbackMaxPlayers);
        bool hasPlayers = false;
        ImGui::PushStyleColor(ImGuiCol_Header, overlayActiveColor.ToVec4());
        ImGui::PushStyleColor(ImGuiCol_HeaderHovered, overlayHoveredColor.ToVec4());
        ImGui::PushStyleColor(ImGuiCol_HeaderActive, overlayPressedColor.ToVec4());
        float keyWidth = ImGui::CalcTextSize("0").x;
        float spacing = ImGui::GetStyle().ItemSpacing.x;
        for (int group = 0; group < voiceMenuOthersGroup; group++) {
            ImGui::PushID(group);
            bool hasGroupHeader = false;
            for (int i = 0; i < playerCount; i++) {
                const PlaybackPlayer& player = state.players[i];
                if (!IsPlayerInVoiceMenuGroup(player, group)) {
                    continue;
                }

                if (!hasGroupHeader) {
                    if (hasPlayers) {
                        ImGui::Spacing();
                    }
                    hasGroupHeader = true;
                    hasPlayers = true;
                    DrawVoiceMenuGroupLabel(group);
                }

                ImGui::PushID(player.slot);
                if (!player.isAlive) {
                    ImGui::PushStyleColor(ImGuiCol_Text, overlayMutedTextColor.ToVec4());
                }
                bool isSpectated = player.slot == state.spectatedSlot && state.currentCameraIndex < 0;
                // The number key that spectates the player is right-aligned like a menu shortcut.
                ImVec2 position = ImGui::GetCursorScreenPos();
                float rowWidth = ImGui::CalcTextSize(player.name).x + spacing + keyWidth;
                float rowEnd = position.x + std::max(ImGui::GetContentRegionAvail().x, rowWidth);
                // The menu stays open to switch between players.
                if (ImGui::Selectable(player.name, isSpectated,
                                      ImGuiSelectableFlags_NoAutoClosePopups | ImGuiSelectableFlags_SpanAvailWidth,
                                      ImVec2(rowWidth, 0.f))) {
                    PlaybackAction action = MakeAction(PLAYBACK_ACTION_SPECTATE_PLAYER);
                    action.slot = player.slot;
                    AddAction(actions, action);
                }
                if (player.numberKey >= 0) {
                    char key[12];
                    snprintf(key, sizeof(key), "%d", player.numberKey);
                    ImGui::GetWindowDrawList()->AddText(ImVec2(rowEnd - ImGui::CalcTextSize(key).x, position.y),
                                                        ImGui::GetColorU32(ImGuiCol_TextDisabled), key);
                }
                if (!player.isAlive) {
                    ImGui::PopStyleColor();
                }
                ImGui::PopID();
            }
            ImGui::PopID();
        }
        ImGui::PopStyleColor(3);

        if (!hasPlayers) {
            ImGui::TextDisabled("No players");
        }
    }
    EndPanelMenu(isOpen);
}
