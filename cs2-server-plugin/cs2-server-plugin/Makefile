CXX = g++

CXXFLAGS =  -std=c++17 \
			-Wall \
			-shared \
			-fPIC \
			-DPOSIX=1 \
			-DNO_MALLOC_OVERRIDE=1 \
			-DCOMPILER_GCC=1 \
			-DPLATFORM_POSIX=1 \
			-DX64BITS=1 \
			-DPLATFORM_64BITS=1 \
			-DLINUX=1 \
			-Dstricmp=strcasecmp

INCLUDE_DIRS =  -I./deps/json/include \
				-I./deps/easywsclient \
				-I./deps/hl2sdk/public \
				-I./deps/hl2sdk/public/tier0 \
				-I./deps/hl2sdk/public/tier1

LIB_DIRS = -L./deps/hl2sdk/lib/linux64
LIBS = -ldl -ltier0 -l:tier1.a

SRC_FILES = main.cpp \
			./deps/easywsclient/easywsclient.cpp \
			./deps/hl2sdk/tier1/convar.cpp

TARGET = libserver.so

.clean:
	rm -f $(TARGET)
	rm -f *.o

build:
	@"$(MAKE)" .clean
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(INCLUDE_DIRS) $(LIB_DIRS) $(LIBS) $(SRC_FILES)
	mv $(TARGET) ../../static/cs2/$(TARGET)
