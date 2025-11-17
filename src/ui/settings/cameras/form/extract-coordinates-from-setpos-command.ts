import type { CameraCoordinates } from 'csdm/common/types/camera';

// setpos 454.834656 2099.009033 -63.182327;setang 1.172819 131.228394 0.000000
export function extractCoordinatesFromSetPosCommand(command: string): CameraCoordinates {
  const parts = command.split(';');
  if (parts.length !== 2) {
    throw new Error('Invalid setpos command format');
  }
  const [setposPart, setangPart] = command.split(';');
  const positionParts = setposPart.trim().split(' ');
  if (positionParts.length !== 4) {
    throw new Error('Invalid setpos command format');
  }
  const angleParts = setangPart.trim().split(' ');
  if (angleParts.length !== 4) {
    throw new Error('Invalid setang command format');
  }

  const x = parseFloat(positionParts[1]);
  const y = parseFloat(positionParts[2]);
  const z = parseFloat(positionParts[3]);
  const pitch = parseFloat(angleParts[1]);
  const yaw = parseFloat(angleParts[2]);
  if ([x, y, z, pitch, yaw].some((value) => Number.isNaN(value))) {
    throw new Error('Invalid setpos or setang command format');
  }

  return {
    x,
    y,
    z,
    yaw,
    pitch,
  };
}
