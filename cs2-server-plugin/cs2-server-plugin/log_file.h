#pragma once

#include <cstdarg>
#include <cstdio>
#include <cstring>
#include <mutex>

// Used by the plugin and the Vulkan layer, each with its own file since the loader loads the layer before the plugin.
// Header-only and free of tier0, which the layer doesn't link.
//
// The path is a bare file name so the file lands in the game's working directory, next to its executable, where the app
// reveals and deletes it.
class LogFile {
   public:
    constexpr explicit LogFile(const char* fileName) : path(fileName) {}

    ~LogFile() { Close(); }

    const char* Path() const { return path; }

    void AppendLine(const char* format, ...) {
        va_list arguments;
        va_start(arguments, format);
        char message[maxLineLength] = {};
        int length = vsnprintf(message, sizeof(message), format, arguments);
        va_end(arguments);
        if (length < 0) {
            return;
        }

        WriteLine(message, (size_t)length < sizeof(message) ? (size_t)length : sizeof(message) - 1);
    }

    void Write(const char* message) { WriteLine(message, strlen(message)); }

    void Close() {
        std::lock_guard<std::mutex> lock(mutex);
        if (file != NULL) {
            fclose(file);
            file = NULL;
        }
    }

   private:
    static constexpr size_t maxLineLength = 1024;

    void WriteLine(const char* message, size_t length) {
        std::lock_guard<std::mutex> lock(mutex);
        if (file == NULL) {
            file = fopen(path, "a");
            if (file == NULL) {
                return;
            }
        }

        fwrite(message, 1, length, file);
        fputc('\n', file);
        fflush(file);
    }

    const char* path;
    FILE* file = NULL;
    std::mutex mutex;
};
