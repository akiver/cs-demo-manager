import type { ErrorCode } from 'csdm/common/error-code';

// Only the message property is preserved from Error instances when catching preload errors from the renderer process.
// See https://www.electronjs.org/docs/latest/tutorial/ipc#1-listen-for-events-with-ipcmainhandle
// As a workaround, we use a "Result Type" pattern to handle errors.
export type PreloadResult<T> =
  | { success: T; error?: undefined }
  | { error: { code: ErrorCode; [key: string]: unknown }; success?: undefined };

export function isSuccessResult<T>(result: PreloadResult<T>): result is { success: T } {
  return 'success' in result;
}
