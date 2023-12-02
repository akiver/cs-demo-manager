import { isMac } from './is-mac';
import { isWindows } from './is-windows';

export const isLinux = !isMac && !isWindows;
