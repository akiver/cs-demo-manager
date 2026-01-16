import process from 'node:process';
import { isLinux } from './is-linux';

export function isLinuxWayland() {
  if (!isLinux) {
    return false;
  }

  return process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland';
}
