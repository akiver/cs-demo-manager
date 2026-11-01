#include "log.h"

#include <cstdarg>
#include <cstdio>
#include <cstdlib>
#ifndef _WIN32
#include <dlfcn.h>
#endif

#include "color.h"
#include "log_file.h"
#include "sdl.h"
#include "tier0/dbg.h"

static LogFile logFile("csdm.log");

const char* GetPluginLogPath() { return logFile.Path(); }

void LogToFile(const char* message) { logFile.Write(message); }

void DeleteLogFile() {
    logFile.Close();
    remove(GetPluginLogPath());
}

void Log(const char* message, ...) {
    va_list args;
    va_start(args, message);
    char buf[1024] = {};
    vsnprintf(buf, sizeof(buf), message, args);
    va_end(args);
    LogToFile(buf);
    ConColorMsg(Color(227, 0, 255, 255), "CSDM: %s\n", buf);
}

void PluginError(const char* message, ...) {
    va_list args;
    va_start(args, message);
    char buf[1024] = {};
    vsnprintf(buf, sizeof(buf), message, args);
    va_end(args);

    LogToFile(buf);

    char dialogMessage[1024 + 32] = {};
    snprintf(dialogMessage, sizeof(dialogMessage), "%s\n\nAborting.", buf);

#ifdef _WIN32
    // The SDK's Plat_FatalError logs and exits without a dialog.
    // We want a dialog, so we use the SDK's message box function and exit.
    Plat_MessageBox("CS Demo Manager", dialogMessage);
    Plat_ExitProcess(EXIT_FAILURE);
#else
    // The SDK has no message box on Linux, so we use SDL to show one.
    void* sdlLib = dlopen(SDL_LIB_NAME, RTLD_NOW | RTLD_NOLOAD);
    if (sdlLib != NULL) {
        auto showMessageBox = (SdlShowSimpleMessageBoxFn)dlsym(sdlLib, "SDL_ShowSimpleMessageBox");
        if (showMessageBox != NULL) {
            showMessageBox(SDL_MESSAGEBOX_ERROR, "CS Demo Manager", dialogMessage, NULL);
        }
    }
    Plat_FatalError("CSDM: %s\n\nAborting.", buf);
#endif
}
