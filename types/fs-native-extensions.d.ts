declare module 'fs-native-extensions' {
  type LockOptions = {
    shared?: boolean;
  };

  export function tryLock(fileDescriptor: number, options?: LockOptions): boolean;
  export function unlock(fileDescriptor: number): void;
}
