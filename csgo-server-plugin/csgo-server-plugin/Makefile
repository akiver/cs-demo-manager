CXX = g++

CXXFLAGS =  -std=c++11 \
			-Wall \
			-shared \
			-fPIC \
			-DPOSIX=1 \
			-DCOMPILER_GCC=1 \
			-DPLATFORM_POSIX=1 \
			-DX64BITS=1 \
			-DPLATFORM_64BITS=1 \
			-Wno-overloaded-virtual \
			-Wno-deprecated-register \
			-Wno-ignored-attributes \
			-Wno-unused-command-line-argument \
			-Wno-unused-private-field \
			-Wno-implicit-exception-spec-mismatch

SDK_DIR = ./deps/hl2sdk

INCLUDE_DIRS =  -I$(SDK_DIR)/common \
				-I$(SDK_DIR)/public \
				-I$(SDK_DIR)/public/tier0 \
				-I$(SDK_DIR)/public/tier1 \
				-I./deps/json/include \
				-I./deps/easywsclient

BUILD_DIR = ./build
PLUGIN_OBJ_DIR = $(BUILD_DIR)/plugin_objs
TIER0_OBJ_DIR = $(BUILD_DIR)/tier0_objs

PLUGIN_SRC_FILES = main.cpp utils.cpp ./deps/easywsclient/easywsclient.cpp
TIER1_SRC_FILES = $(SDK_DIR)/tier1/convar.cpp
TIER0_SRC_FILES = $(SDK_DIR)/public/tier0/memoverride.cpp

PLUGIN_OBJS = $(addprefix $(PLUGIN_OBJ_DIR)/, $(notdir $(PLUGIN_SRC_FILES:.cpp=.o)) $(notdir $(TIER1_SRC_FILES:.cpp=.o)))
TIER0_OBJS = $(addprefix $(TIER0_OBJ_DIR)/, $(notdir $(TIER0_SRC_FILES:.cpp=.o)))

UNAME_S := $(shell uname -s)

ifeq ($(UNAME_S),Linux)
	CXXFLAGS += -D_LINUX=1 -DLINUX
	TARGET_NAME=csdm_client.so
	LIB_DIRS = -L$(SDK_DIR)/lib/linux64
	LIBS =  -lm -ldl -ltier0_client -lvstdlib_client \
			$(SDK_DIR)/lib/linux64/tier1.a \
			$(SDK_DIR)/lib/linux64/mathlib.a \
			$(SDK_DIR)/lib/linux64/interfaces.a
else ifeq ($(UNAME_S),Darwin)
	CXXFLAGS += -DOSX=1 -fdeclspec
	TARGET_NAME=csdm.dylib
	LIB_DIRS = -L$(SDK_DIR)/lib/osx64
	LIBS =  -ldl -ltier0 -lvstdlib \
			$(SDK_DIR)/lib/osx64/tier1.a \
			$(SDK_DIR)/lib/osx64/mathlib.a \
			$(SDK_DIR)/lib/osx64/interfaces.a
endif

TARGET = $(BUILD_DIR)/$(TARGET_NAME)

.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)

dirs:
	@mkdir -p $(BUILD_DIR) $(PLUGIN_OBJ_DIR) $(TIER0_OBJ_DIR)

$(PLUGIN_OBJ_DIR)/%.o: %.cpp | dirs
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -c $< -o $@

$(PLUGIN_OBJ_DIR)/convar.o: $(SDK_DIR)/tier1/convar.cpp | dirs
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -c $< -o $@

$(PLUGIN_OBJ_DIR)/easywsclient.o: ./deps/easywsclient/easywsclient.cpp | dirs
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -c $< -o $@

$(TIER0_OBJ_DIR)/%.o: $(SDK_DIR)/public/tier0/%.cpp | dirs
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -c $< -o $@

$(TARGET): $(PLUGIN_OBJS) $(TIER0_OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $(PLUGIN_OBJS) $(TIER0_OBJS) $(LIB_DIRS) $(LIBS)

build: clean $(TARGET)
	mv $(TARGET) ../../static/$(TARGET_NAME)