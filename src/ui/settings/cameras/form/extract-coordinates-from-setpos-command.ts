import type { CameraCoordinates } from 'csdm/common/types/camera';

// > getpos
// setpos 249.449814 -608.647339 226.903336;setang 3.952865 117.020721 0.000000
// > getpos_exact
// setpos_exact 249.449814 -608.647339 226.903336;setang_exact 14.000015 129.999847 0.000000
// > spec_pos
// spec_goto 249.4 -608.6 226.9 4.0 117.0
export function extractCoordinatesFromCommand(command: string): CameraCoordinates {
  if (command.startsWith('spec_goto')) {
    const parts = command.split(' ');
    if (parts.length !== 6) {
      throw new Error('Invalid spec_goto command format');
    }

    const x = parseFloat(parts[1]);
    const y = parseFloat(parts[2]);
    const z = parseFloat(parts[3]);
    const pitch = parseFloat(parts[4]);
    const yaw = parseFloat(parts[5]);

    if ([x, y, z, pitch, yaw].some((value) => Number.isNaN(value))) {
      throw new Error('Invalid spec_goto command format');
    }

    return {
      x,
      y,
      z,
      yaw,
      pitch,
    };
  }

  const parts = command.split(';');
  if (parts.length !== 2) {
    throw new Error('Invalid setpos command format');
  }
  const [setposPart, setangPart] = parts;
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
