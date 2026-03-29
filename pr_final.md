# PR: Add Custom Output Filename for Concatenated Videos (with Placeholders)

## Issue

Fixes #1348

## Summary

When `Concatenate sequences into 1 video` is enabled, users can now define a custom output filename instead of always getting `output.<ext>`.

The filename supports placeholders that are resolved at generation time:

- `{map}`
- `{checksum}`
- `{game}`
- `{date}`
- `{time}`
- `{encoder}`
- `{resolution}`
- `{framerate}`

If the input is empty (or becomes empty after trim/sanitization), the fallback remains `output`.

## What Changed

### Backend / generation

- Added `concatenatedFileName` to video settings and video payload types.
- Added placeholder replacement in generation flow before concatenation.
- Updated concatenation to accept a resolved `fileName` instead of hardcoded `output`.
- Added filename sanitization for invalid characters (`<>:"/\\|?*`) to keep output names filesystem-safe.
- Removed `as any` and made placeholder replacement input type-safe.

### UI

- Added `Output filename` input shown only when:
  - encoder is FFmpeg
  - output is video (not images-only)
  - concatenate sequences is enabled
- Added tooltip/help content listing supported placeholders.
- Kept UI helper focused on placeholder keys and localized descriptions in the component.

### CLI / pipeline

- Threaded `concatenatedFileName` through CLI command config and generation parameters.
- Included `mapName` in generation parameters for `{map}` replacement.

### Tests

- Added unit tests for placeholder replacement (`replace-filename-placeholders.test.ts`).
- Covers empty/whitespace fallback, single and combined placeholders, sanitization, and formatting behavior.

## Backward Compatibility

- Default behavior is unchanged: empty custom filename still produces `output.<container>`.
- No breaking API changes.

## Validation

- `npm run compile` ✅
- `npx eslint` on touched files ✅
- `npm run test -- src/node/video/generation/replace-filename-placeholders.test.ts` ✅ (15 tests)
