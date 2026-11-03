CXX = g++

CXXFLAGS =  -std=c++17 \
			-Wall \
			-Wno-switch \
			-shared \
			-fPIC \
			-DPOSIX=1 \
			-DCOMPILER_GCC=1 \
			-DPLATFORM_POSIX=1 \
			-DX64BITS=1 \
			-DPLATFORM_64BITS=1 \
			-DLINUX=1 \
			-Dstricmp=strcasecmp \
			-D_GLIBCXX_USE_CXX11_ABI=0

DEV_COMMANDS ?= 0
ifeq ($(DEV_COMMANDS),1)
CXXFLAGS += -DCSDM_DEV_COMMANDS=1 -g
endif

INCLUDE_DIRS =  -I. \
				-I./deps/json/include \
				-I./deps/easywsclient \
				-I./deps/s2sdk/public \
				-I./deps/s2sdk/public/tier0 \
				-I./deps/s2sdk/public/tier1 \
				-I./deps/s2sdk/public/mathlib \
				-I./deps/s2sdk/game/shared \
				-I./protobuf \
				-I./deps/s2sdk/thirdparty/protobuf-3.21.8/src

LIB_DIRS = -L./deps/s2sdk/lib/linux64 -L./deps/s2sdk/lib/linux64/release
LIBS = -ldl -ltier0 -lprotobuf -lpthread

# Generated with deps/s2sdk/devtools/bin/protoc
PROTOBUF_FILES =    ./protobuf/netmessages.pb.cc \
					./protobuf/networkbasetypes.pb.cc \
					./protobuf/network_connection.pb.cc \
					./protobuf/source2_steam_stats.pb.cc \
					./protobuf/usercmd.pb.cc \
					./protobuf/cs_usercmd.pb.cc \
					./protobuf/valveextensions.pb.cc

SRC_FILES = main.cpp \
			log.cpp \
			library.cpp \
			vtable.cpp \
			memory.cpp \
			overlay_linux.cpp \
			buttons_overlay.cpp \
			buttons_overlay_target.cpp \
			playback_overlay.cpp \
			playback_overlay_linux.cpp \
			playback_seek.cpp \
			playback_player_lock.cpp \
			playback_sequence.cpp \
			playback_timeline_file.cpp \
			playback_cameras.cpp \
			convars.cpp \
			player_voices.cpp \
			player_names.cpp \
			voice_activity.cpp \
			voice_indicator.cpp \
			player_controllers.cpp \
			entity_system.cpp \
			schema.cpp \
			net_messages.cpp \
			user_commands.cpp \
			websocket.cpp \
			sequences.cpp \
			settings.cpp \
			overlay_positions.cpp \
			gameinfo.cpp \
			./commands/csdm_info.cpp \
			./commands/csdm_dump_net_messages.cpp \
			./commands/csdm_dump_demoplayer_vtable.cpp \
			./commands/csdm_ui.cpp \
			./commands/csdm_demo_goto.cpp \
			./commands/csdm_demo_loop.cpp \
			./commands/csdm_demo_goto_next_round.cpp \
			./commands/csdm_demo_goto_previous_round.cpp \
			./commands/csdm_demo_goto_round.cpp \
			./commands/csdm_demo_goto_next_kill.cpp \
			./commands/csdm_demo_goto_previous_kill.cpp \
			./commands/csdm_demo_goto_next_highlight.cpp \
			./commands/csdm_demo_goto_previous_highlight.cpp \
			./commands/csdm_demo_goto_next_lowlight.cpp \
			./commands/csdm_demo_goto_previous_lowlight.cpp \
			./commands/csdm_demo_skip.cpp \
			./commands/csdm_players.cpp \
			./commands/csdm_voice_mute.cpp \
			./commands/csdm_voice_unmute.cpp \
			./commands/csdm_replace_player_name.cpp \
			./commands/csdm_camera.cpp \
			./commands/csdm_camera_next.cpp \
			./commands/csdm_camera_previous.cpp \
			./commands/csdm_camera_off.cpp \
			./commands/csdm_lock_player.cpp \
			./commands/csdm_unlock_player.cpp \
			./commands/csdm_cameras.cpp \
			./cvars/csdm_buttons_overlay.cpp \
			./cvars/csdm_buttons_overlay_pos.cpp \
			./cvars/csdm_playback_overlay_pos.cpp \
			./cvars/csdm_voice_indicator.cpp \
			./cvars/csdm_voice_indicator_pos.cpp \
			./cvars/csdm_match_timeline.cpp \
			./cvars/csdm_round_timeline.cpp \
			./cvars/csdm_round_timeline_spectated_only.cpp \
			./cvars/csdm_follow_killer.cpp \
			./cvars/csdm_overlay_background_opacity.cpp \
			./cvars/csdm_overlay_scale.cpp \
			./cvars/csdm_overlay_tooltips.cpp \
			./cvars/csdm_playback_overlay_auto_hide_delay.cpp \
			./cvars/csdm_playback_skip_seconds.cpp \
			./deps/easywsclient/easywsclient.cpp \
			./deps/s2sdk/tier0_perproject/convar.cpp \
			$(PROTOBUF_FILES)

TARGET = libserver.so

# Vulkan layer drawing the overlays on Linux, see vulkan-layer/. It is a separate library because the Vulkan loader
# loads it when the game creates its instance, long before the game loads the plugin. It doesn't link the loader,
# everything it calls comes from the layer chain. NDEBUG turns the ImGui asserts off, they would abort the game.
VULKAN_LAYER_CXXFLAGS = -std=c++17 \
						-Wall \
						-shared \
						-fPIC \
						-O2 \
						-fvisibility=hidden \
						-DNDEBUG \
						-DVK_NO_PROTOTYPES \
						-DIMGUI_IMPL_VULKAN_NO_PROTOTYPES \
						-DIMGUI_USE_WCHAR32

VULKAN_LAYER_INCLUDE_DIRS = -I. \
							-I./deps/imgui \
							-I./deps/imgui/backends

VULKAN_LAYER_SRC_FILES = ./vulkan-layer/vulkan_layer.cpp \
						 ./vulkan-layer/vulkan_overlay.cpp \
						 ./vulkan-layer/log.cpp \
						 ./ui/overlay_font.cpp \
						 ./ui/buttons_panel.cpp \
						 ./ui/playback_panel.cpp \
						 ./ui/playback_widgets.cpp \
						 ./ui/playback_state.cpp \
						 ./ui/playback_icons.cpp \
						 ./ui/playback_goto_menu.cpp \
						 ./ui/playback_menus.cpp \
						 ./ui/playback_settings_menu.cpp \
						 ./ui/playback_match_timeline.cpp \
						 ./ui/playback_round_timeline.cpp \
						 ./ui/playback_toolbar.cpp \
						 ./ui/voice_indicator_panel.cpp \
						 ./ui/overlay_toasts.cpp \
						 ./deps/imgui/imgui.cpp \
						 ./deps/imgui/imgui_draw.cpp \
						 ./deps/imgui/imgui_tables.cpp \
						 ./deps/imgui/imgui_widgets.cpp \
						 ./deps/imgui/backends/imgui_impl_vulkan.cpp

VULKAN_LAYER_LIBS = -lpthread

VULKAN_LAYER_TARGET = libcsdm_vulkan_layer.so

# Sources formatted with clang-format. deps/ are third-party submodules and protobuf/ is generated by protoc, they are left untouched.
FORMAT_FILES = $(shell find . \( -path ./deps -o -path ./protobuf \) -prune -o -type f \( -name '*.cpp' -o -name '*.h' \) -print)
# Major versions don't format everything the same way, the version is pinned to avoid whitespace-only diffs between
# contributors. The binary is looked up as clang-format-<version>, then as clang-format.
# Override it with `make format CLANG_FORMAT=/path/to/clang-format`.
CLANG_FORMAT_VERSION = 23
CLANG_FORMAT ?= $(firstword $(shell command -v clang-format-$(CLANG_FORMAT_VERSION) 2>/dev/null) clang-format)

.PHONY: build build-sniper vulkan-layer format .clean

.clean:
	rm -f $(TARGET)
	rm -f $(VULKAN_LAYER_TARGET)
	rm -f *.o

build:
	@"$(MAKE)" .clean
	# The libraries go after the sources: static archives (libprotobuf.a) only provide symbols to objects listed before
	# them, and a shared build doesn't report the missing symbols, the .so fails to load at runtime instead.
	# --start-group/--end-group lets the libraries resolve each other in any order.
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(INCLUDE_DIRS) $(SRC_FILES) $(LIB_DIRS) -Wl,--start-group $(LIBS) -Wl,--end-group
	mv $(TARGET) ../../static/cs2/$(TARGET)
	@"$(MAKE)" vulkan-layer

vulkan-layer:
	$(CXX) $(VULKAN_LAYER_CXXFLAGS) -o $(VULKAN_LAYER_TARGET) $(VULKAN_LAYER_INCLUDE_DIRS) $(VULKAN_LAYER_SRC_FILES) $(VULKAN_LAYER_LIBS)
	mv $(VULKAN_LAYER_TARGET) ../../static/cs2/$(VULKAN_LAYER_TARGET)

format:
	@version=$$($(CLANG_FORMAT) --version 2>/dev/null); \
	case "$$version" in \
		*"version $(CLANG_FORMAT_VERSION)."*) ;; \
		*) echo "clang-format $(CLANG_FORMAT_VERSION) is required, found: $${version:-none}" >&2; \
			echo "Install clang-format-$(CLANG_FORMAT_VERSION) from https://apt.llvm.org or set CLANG_FORMAT=/path/to/clang-format." >&2; \
			exit 1 ;; \
	esac
	$(CLANG_FORMAT) -i $(FORMAT_FILES)

# Same build inside the Steam Runtime "sniper" SDK image CS2 runs in, so the binaries don't link glibc/libstdc++
# symbols newer than the game's container.
SNIPER_SDK_IMAGE = registry.gitlab.steamos.cloud/steamrt/sniper/sdk:latest

build-sniper:
	docker run --rm \
		--volume "$(abspath $(CURDIR)/../..):/workspace" \
		--workdir /workspace/cs2-server-plugin/cs2-server-plugin \
		$(SNIPER_SDK_IMAGE) \
		bash -c "apt-get update && apt-get install -y libvulkan-dev && make build DEV_COMMANDS=$(DEV_COMMANDS) && chown $(shell id -u):$(shell id -g) ../../static/cs2/$(TARGET) ../../static/cs2/$(VULKAN_LAYER_TARGET)"
