export function isCtrlOrCmdEvent(event: MouseEvent | KeyboardEvent) {
  return (window.csdm.isMac && event.metaKey) || (!window.csdm.isMac && event.ctrlKey);
}

export function isSelectAllKeyboardEvent(event: KeyboardEvent): boolean {
  if (event.key.toLocaleLowerCase() !== 'a') {
    return false;
  }

  return isCtrlOrCmdEvent(event);
}
