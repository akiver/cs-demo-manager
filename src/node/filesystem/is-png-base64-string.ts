export function isPngBase64String(value: string): boolean {
  return value.startsWith('data:image/png;base64,');
}
