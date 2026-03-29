# PR: Add Custom Filename Input for Concatenated Videos with Placeholder Support

## Issue Reference

Fixes #1348

## Problem Statement

When concatenating video sequences into a single video, the output filename was **hardcoded to "output"** with no way for users to customize it. Users requested the ability to specify custom filenames, preferably with dynamic placeholders (like map name, date, etc.).

## Solution Overview

Added a new "Output filename" input field that appears when "Concatenate sequences into 1 video" is enabled. The input supports **8 placeholders** that get dynamically replaced at video generation time.

## Changes Made

### 1. Type Definitions (Backend)

- **File:** `src/node/settings/settings.ts`
  - Added `concatenatedFileName: string` to `VideoSettings` type
- **File:** `src/common/types/video.ts`
  - Added `concatenatedFileName: string` to `Video` type
  - Fixed duplicate `WatchVideoSequencesPayload` definition

### 2. Default Settings

- **File:** `src/node/settings/default-settings.ts`
  - Added `concatenatedFileName: ''` (empty string = use default "output")

### 3. Core Logic

- **File:** `src/node/video/generation/replace-filename-placeholders.ts` (NEW)
  - Pure function that replaces placeholders with actual values
  - Sanitizes invalid filename characters (`<`, `>`, `"`, `\`, `/`, `|`, `?`, `*`)
  - Falls back to "output" if result is empty
  - Uses `date-fns` for consistent date/time formatting

- **File:** `src/node/video/generation/concatenate-videos-from-sequences.ts`
  - Updated to accept `fileName` parameter
  - Uses the processed filename (with placeholders already replaced)

- **File:** `src/node/video/generation/generate-video.ts`
  - Added `mapName` to `Parameters` type (needed for `{map}` placeholder)
  - Calls `replaceFilenamePlaceholders()` before concatenation
  - Passes resolved filename to `concatenateVideosFromSequences()`

### 4. UI Components

- **File:** `src/ui/match/video/concatenated-file-name-input.tsx` (NEW)
  - Text input with tooltip showing available placeholders
  - Only visible when:
    - FFmpeg is selected as encoder
    - Recording output is "Video" (not "Images")
    - "Concatenate sequences" is enabled
  - Uses `useVideoSettings()` hook for persistence

- **File:** `src/ui/match/video/concatenated-file-name-utils.ts` (NEW)
  - UI-side placeholder definitions for the tooltip

- **File:** `src/ui/match/video/video.tsx`
  - Added import and rendered `<ConcatenatedFileNameInput />` below the checkbox

### 5. CLI Support

- **File:** `src/cli/commands/video-command.ts`
  - Added `concatenatedFileName` to `VideoCommandConfig` type
  - Passes settings value through the video generation pipeline

### 6. Tests

- **File:** `src/node/video/generation/replace-filename-placeholders.test.ts` (NEW)
  - 14 comprehensive unit tests covering:
    - Empty/whitespace handling
    - Plain filenames without placeholders
    - Each individual placeholder
    - Multiple placeholders combined
    - Date/time format validation
    - Invalid character sanitization
    - All placeholders together

- **File:** `src/node/video/generation/show-test-results.ts` (NEW)
  - Standalone script to visualize actual input/output examples
  - Run with: `npx tsx src/node/video/generation/show-test-results.ts`

### 7. Dependencies

- **File:** `package.json`, `package-lock.json`
  - Installed missing `@fast-csv/parse` dependency (pre-existing issue)

## Available Placeholders

| Placeholder    | Example Output | Description                |
| -------------- | -------------- | -------------------------- |
| `{map}`        | `de_dust2`     | Map name from the demo     |
| `{checksum}`   | `abc123xyz`    | Match checksum/unique ID   |
| `{game}`       | `CS2`          | Game version (CS2 or CSGO) |
| `{date}`       | `2026-03-25`   | Current date (YYYY-MM-DD)  |
| `{time}`       | `13-52-34`     | Current time (HH-MM-SS)    |
| `{encoder}`    | `FFmpeg`       | Encoder software used      |
| `{resolution}` | `1920x1080`    | Video resolution (WxH)     |
| `{framerate}`  | `60`           | Video framerate (fps)      |

## Example Usage

**User Input:**

```
{map}_highlights_{date}
```

**Resulting Filename:**

```
de_dust2_highlights_2026-03-25.avi
```

## Why This Solution is Good

### 1. **User-Friendly**

- Input appears only when relevant (concatenation enabled + FFmpeg selected)
- Tooltip shows all available placeholders with descriptions
- No configuration required - works out of the box

### 2. **Flexible**

- Supports any combination of placeholders
- Plain text works too (no placeholders needed)
- Falls back gracefully to "output" if empty

### 3. **Safe**

- Invalid filename characters are automatically sanitized
- Empty/whitespace-only input defaults to "output"
- No risk of path traversal or injection attacks

### 4. **Consistent**

- Follows existing codebase patterns (React hooks, settings persistence)
- Uses same styling as other inputs in the video panel
- Integrates seamlessly with existing video generation flow

### 5. **Well-Tested**

- 14 unit tests covering all edge cases
- Manual verification script for visual confirmation
- All existing tests still pass (34 total tests passing)

### 6. **Maintainable**

- Pure function for placeholder replacement (easy to test)
- Clear separation of concerns (UI vs logic vs file operations)
- Minimal changes to existing code paths

## Testing

### Unit Tests

```bash
npm test
# All 34 tests pass (20 existing + 14 new)
```

### Manual Verification

```bash
npx tsx src/node/video/generation/show-test-results.ts
```

Shows actual input/output examples:

```
Test: Map name placeholder
  Input:    "{map}"
  Output:   "de_dust2"

Test: Resolution and framerate
  Input:    "{resolution}_{framerate}fps"
  Output:   "1920x1080_60fps"
```

### Manual E2E Test

1. Open a match → Video tab
2. Check "Concatenate sequences into 1 video"
3. Enter filename: `{map}_highlights`
4. Add sequences and generate
5. Output file: `de_dust2_highlights.avi` ✅

## Backwards Compatibility

- Default behavior unchanged (empty = "output")
- Existing settings automatically get default empty string
- No breaking changes to any APIs

## Screenshots

**UI with tooltip:**

- Input field appears below "Concatenate sequences into 1 video" checkbox
- "?" icon shows tooltip with placeholder reference on hover

**Test output:**

```
Test Files  7 passed (7)
     Tests  34 passed (34)
```

## Related Files Changed

- 14 files changed
- 337 insertions(+), 4 deletions(-)
- 4 new files created

## Checklist

- [x] Feature implemented
- [x] Unit tests added (14 new tests)
- [x] All existing tests pass
- [x] TypeScript compiles without errors
- [x] Follows existing codebase patterns
- [x] Backwards compatible
- [x] No breaking changes
