#include "log.h"

#include <cstdarg>
#include <cstdio>

#include "../log_file.h"

#define LOG_PREFIX "CSDM: "

static LogFile logFile("csdm-vulkan.log");

void LayerLog(const char* format, ...) {
    char message[1024] = LOG_PREFIX;
    constexpr size_t prefixLength = sizeof(LOG_PREFIX) - 1;

    va_list arguments;
    va_start(arguments, format);
    vsnprintf(message + prefixLength, sizeof(message) - prefixLength, format, arguments);
    va_end(arguments);

    logFile.Write(message);
}
