import type { ColumnID } from '../types/column-id';

type ObjectWithTick = {
  id: ColumnID;
  tick: number;
};

export function fillMissingTicks<T extends ObjectWithTick>(objects: T[]) {
  if (objects.length < 2) {
    return objects;
  }

  const objectsByTick = new Map<number, T[]>();
  for (const obj of objects) {
    const existing = objectsByTick.get(obj.tick);
    if (existing) {
      existing.push(obj);
    } else {
      objectsByTick.set(obj.tick, [obj]);
    }
  }

  const minTick = objects[0].tick;
  const maxTick = objects[objects.length - 1].tick;

  const newObjects: T[] = [];
  let lastTickObjects: T[] = [];

  for (let tick = minTick; tick <= maxTick; tick++) {
    const currentObjects = objectsByTick.get(tick);
    if (currentObjects) {
      newObjects.push(...currentObjects);
      lastTickObjects = currentObjects;
    } else {
      newObjects.push(
        ...lastTickObjects.map((obj) => ({
          ...obj,
          id: `${obj.id}_filled`,
          tick,
        })),
      );
    }
  }

  return newObjects;
}
