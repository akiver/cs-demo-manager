export function makeElementInert(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.inert = true;
  }
}

export function makeElementNonInert(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.inert = false;
  }
}
