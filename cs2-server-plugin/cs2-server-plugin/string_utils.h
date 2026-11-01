#pragma once

#include <algorithm>
#include <cctype>
#include <cstring>
#include <string_view>

inline bool IsDigits(std::string_view text) {
    return !text.empty() && std::all_of(text.begin(), text.end(), [](unsigned char c) { return std::isdigit(c); });
}

inline bool EqualsNoCase(std::string_view a, std::string_view b) {
    return std::equal(a.begin(), a.end(), b.begin(), b.end(),
                      [](unsigned char x, unsigned char y) { return std::tolower(x) == std::tolower(y); });
}

inline bool StartsWithNoCase(std::string_view text, std::string_view prefix) {
    return text.size() >= prefix.size() && EqualsNoCase(text.substr(0, prefix.size()), prefix);
}

// How many bytes of the UTF-8 `source` fit in a buffer of `size` bytes once it is null-terminated, without cutting a
// multi-byte character in two. `size` must hold at least the null terminator.
inline size_t Utf8TruncatedLength(std::string_view source, size_t size) {
    size_t length = source.size();
    if (length >= size) {
        length = size - 1;
        while (length > 0 && ((unsigned char)source[length] & 0xC0) == 0x80) {
            length--;
        }
    }

    return length;
}

// Copies at most `N` - 1 bytes of the UTF-8 `source` into `destination` and null-terminates it, without cutting a
// multi-byte character in two. `N` comes from the array type so it can't drift from the buffer size.
template <size_t N>
inline void CopyUtf8Truncated(char (&destination)[N], std::string_view source) {
    static_assert(N > 0, "destination must hold at least the null terminator");

    size_t length = Utf8TruncatedLength(source, N);
    if (length > 0) {
        memcpy(destination, source.data(), length);
    }
    destination[length] = '\0';
}
