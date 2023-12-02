import { useRef } from 'react';
import { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import { usePlaySound } from './use-play-sound';
import { useViewerContext } from '../use-viewer-context';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { degreesToRadians } from './degrees-to-radians';
import type { Shot } from 'csdm/common/types/shot';
import { AudioFileName } from './use-play-sound';
import { getTeamColor } from '../../../styles/get-team-color';

type AnimatedShot = Shot & {
  time: number;
};

export function useDrawShots() {
  const { shots, currentFrame } = useViewerContext();
  const { playSound } = usePlaySound();
  const pendingAnimatedShotsRef = useRef<AnimatedShot[]>([]);

  const playWeaponAudio = (weaponName: WeaponName, side: TeamNumber) => {
    let audioFileName: AudioFileName;
    switch (weaponName) {
      case WeaponName.Flashbang:
        audioFileName = side === TeamNumber.CT ? AudioFileName.CTFlashbang : AudioFileName.TFlashbang;
        playSound(audioFileName);
        break;
      case WeaponName.Smoke:
        audioFileName = side === TeamNumber.CT ? AudioFileName.CTSmoke : AudioFileName.TSmoke;
        playSound(audioFileName);
        break;
      case WeaponName.HEGrenade:
        audioFileName = side === TeamNumber.CT ? AudioFileName.CTGrenade : AudioFileName.TGrenade;
        playSound(audioFileName);
        break;
      case WeaponName.Molotov:
      case WeaponName.Incendiary:
        audioFileName = side === TeamNumber.CT ? AudioFileName.CTMolotov : AudioFileName.TMolotov;
        playSound(audioFileName);
        break;
      case WeaponName.Decoy:
        audioFileName = side === TeamNumber.CT ? AudioFileName.CTDecoy : AudioFileName.TDecoy;
        playSound(audioFileName);
        break;
    }
  };

  const drawShots = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    const pendingAnimatedShots = pendingAnimatedShotsRef.current;

    for (const shot of pendingAnimatedShots) {
      const x = zoomedToRadarX(shot.x);
      const y = zoomedToRadarY(shot.y);
      const playerAngle = -degreesToRadians(shot.playerYaw);
      const playerRadius = zoomedSize(8);
      const startX = x + playerRadius * Math.cos(playerAngle);
      const startY = y + playerRadius * Math.sin(playerAngle);
      context.beginPath();
      context.lineWidth = zoomedSize(1);
      context.strokeStyle = getTeamColor(shot.playerSide);
      context.moveTo(startX, startY);
      const lineLength = zoomedSize(80);
      context.lineTo(
        startX + lineLength * shot.time * Math.cos(playerAngle),
        startY + lineLength * shot.time * Math.sin(playerAngle),
      );
      context.stroke();
      shot.time += 0.1;
    }

    const frameShots = shots.filter((shot) => {
      return shot.frame === currentFrame;
    });
    for (const shot of frameShots) {
      pendingAnimatedShots.push({
        ...shot,
        time: 0.1,
      });

      playWeaponAudio(shot.weaponName, shot.playerSide);
    }
    pendingAnimatedShotsRef.current = pendingAnimatedShots.filter((animation) => {
      return animation.time < 1;
    });
  };

  return { drawShots };
}
