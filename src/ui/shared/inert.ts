// Several overlays (settings, dialogs, full screen dialogs) can make the same element inert at the same time.
// Each caller identifies itself with an owner so the element stays inert until every owner released it.
const inertOwnerIdsPerElementId = new Map<string, Set<string>>();

function setElementInert(elementId: string, inert: boolean) {
  const element = document.getElementById(elementId);
  if (element) {
    element.inert = inert;
  }
}

export function makeElementInert(elementId: string, ownerId: string) {
  const ownerIds = inertOwnerIdsPerElementId.get(elementId) ?? new Set<string>();
  ownerIds.add(ownerId);
  inertOwnerIdsPerElementId.set(elementId, ownerIds);
  setElementInert(elementId, true);
}

export function makeElementNonInert(elementId: string, ownerId: string) {
  const ownerIds = inertOwnerIdsPerElementId.get(elementId);
  if (ownerIds === undefined) {
    return;
  }

  ownerIds.delete(ownerId);
  if (ownerIds.size > 0) {
    return;
  }

  inertOwnerIdsPerElementId.delete(elementId);
  setElementInert(elementId, false);
}

// Forces the element to be non-inert regardless of the owners, useful when overlays are unmounted without releasing it.
export function resetElementInert(elementId: string) {
  inertOwnerIdsPerElementId.delete(elementId);
  setElementInert(elementId, false);
}
