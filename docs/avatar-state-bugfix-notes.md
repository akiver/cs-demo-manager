# Avatar State Bugfix Notes

## Issue

When switching between pinned player profiles, the player name updated immediately but the avatar could show the
previous player's image.

## Cause

`src/ui/components/avatar.tsx` and `src/ui/components/table/cells/avatar-cell.tsx` copied the initial `avatarUrl` prop
into local React state. The state was only changed by the image `onError` handler, so a reused component instance kept
the previous image source when a new player was rendered.

## Fix

Both avatar components now derive an `avatarSrc` from the latest `avatarUrl` prop and synchronize the local `src` state
in a `useEffect`. The local state is still kept so a broken image URL can fall back to the default avatar.

Validation:

- `vp run compile`
- `vp run lint`
- `vp run test`
- `vp run deadcode`
- `vp run build`
