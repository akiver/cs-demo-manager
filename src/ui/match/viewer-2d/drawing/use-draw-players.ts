import { GrenadeName, WeaponName } from 'csdm/common/types/counter-strike';
import { degreesToRadians } from './degrees-to-radians';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useBombImage } from './use-bomb-image';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { getGrenadeColor } from './get-grenade-color';
import { useViewerContext } from '../use-viewer-context';
import { buildPlayerId } from '../build-player-id';

export function useDrawPlayers() {
  const {
    playerPositions,
    currentTick,
    focusedPlayerId,
    bombsDefuseStart,
    bombsPlantStart,
    tickrate,
    hostagesPickUpStart,
    hostagesPickedUp,
  } = useViewerContext();
  const bombImage = useBombImage();

  const drawPlayers = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    const positions = playerPositions.filter((position) => position.tick === currentTick);
    const playersAlivePositions = positions.filter((position) => position.isAlive);

    for (const position of playersAlivePositions) {
      const x = zoomedToRadarX(position.x);
      const y = zoomedToRadarY(position.y);

      const isFocusedPlayer = focusedPlayerId === buildPlayerId(position.playerSteamId, position.playerName);
      const playerRadius = zoomedSize(8);
      context.beginPath();
      context.arc(x, y, playerRadius, 0, 2 * Math.PI);
      context.strokeStyle = isFocusedPlayer ? '#ff0000' : '#ffffff';
      context.lineWidth = zoomedSize(2);
      context.fillStyle = getTeamColor(position.side);
      context.fill();
      context.stroke();

      if (position.health < 100) {
        context.beginPath();
        context.fillStyle = '#d7373f99';
        const percentage = position.health / 100;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * -percentage;
        context.arc(x, y, zoomedSize(7), startAngle, endAngle);
        context.lineTo(x, y);
        context.fill();
      }

      const playerAngle = -degreesToRadians(position.yaw);
      const isHoldingKnife = position.activeWeaponName === WeaponName.Knife;
      const isHoldingGrenade = Object.values(GrenadeName).includes(position.activeWeaponName as GrenadeName);
      if (isHoldingKnife || isHoldingGrenade) {
        const triangleLength1 = zoomedSize(4);
        const triangleLength2 = zoomedSize(4);
        const x0 = x + (playerRadius + triangleLength1) * Math.cos(playerAngle);
        const y0 = y + (playerRadius + triangleLength1) * Math.sin(playerAngle);
        const outerX = x + playerRadius * Math.cos(playerAngle);
        const outerY = y + playerRadius * Math.sin(playerAngle);
        const x1 = outerX + triangleLength2 * Math.cos(playerAngle - Math.PI / 2);
        const y1 = outerY + triangleLength2 * Math.sin(playerAngle - Math.PI / 2);
        const x2 = outerX + triangleLength2 * Math.cos(playerAngle + Math.PI / 2);
        const y2 = outerY + triangleLength2 * Math.sin(playerAngle + Math.PI / 2);
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.fill();

        if (isHoldingGrenade) {
          const grenadeRadius = zoomedSize(3);
          context.beginPath();
          context.arc(x, y - playerRadius, grenadeRadius, 0, 2 * Math.PI);
          context.fillStyle = getGrenadeColor(position.activeWeaponName as GrenadeName);
          context.fill();
        }
      } else {
        context.beginPath();
        context.lineWidth = zoomedSize(2);
        const lineLength = position.isScoping ? zoomedSize(8 + 6) : zoomedSize(8 + 2);
        context.moveTo(x, y);
        context.lineTo(x + lineLength * Math.cos(playerAngle), y + lineLength * Math.sin(playerAngle));
        context.strokeStyle = 'white';
        context.stroke();
      }

      if (position.hasBomb) {
        const bombOffsetX = x + playerRadius / 2;
        const bombOffsetY = zoomedSize(20);
        context.drawImage(bombImage, bombOffsetX, y - bombOffsetY, zoomedSize(14), zoomedSize(14));
      }

      context.font = `${zoomedSize(10)}px Inter var`;
      context.fillStyle = 'white';
      const playerNameOffset = zoomedSize(20);
      context.fillText(position.playerName, x - playerNameOffset, y + playerNameOffset);

      if (position.flashDurationRemaining > 0) {
        context.beginPath();
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const maxFlashDuration = 5.25;
        const percentage = position.flashDurationRemaining / maxFlashDuration;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * percentage;
        context.arc(x, y, zoomedSize(16), startAngle, endAngle);
        context.lineTo(x, y);
        context.fill();
      }

      if (position.isDefusing) {
        const bombDefuseStart = bombsDefuseStart.find((event) => event.tick < currentTick);
        if (bombDefuseStart) {
          const defuseSecondsRequired = position.hasDefuseKit ? 5 : 10;
          const startDefusingTick = currentTick - bombDefuseStart.tick;
          const percentage = startDefusingTick / (defuseSecondsRequired * tickrate);
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * percentage;
          context.beginPath();
          context.fillStyle = 'rgb(51, 171, 132, 0.5)';
          context.arc(x, y, zoomedSize(14), startAngle, endAngle);
          context.lineTo(x, y);
          context.fill();
        }
      }

      if (position.isGrabbingHostage) {
        const untieHostageWithKitDuration = 1;
        const untieHostageDuration = 4;
        let pickUpSecondsRequired = position.hasDefuseKit ? untieHostageWithKitDuration : untieHostageDuration;
        const hostagePickUpStart = hostagesPickUpStart.find((event) => {
          return event.tick < currentTick && event.tick > currentTick - pickUpSecondsRequired * tickrate;
        });
        if (hostagePickUpStart) {
          if (!position.hasDefuseKit) {
            const isHostageAlreadyUntied = hostagesPickedUp.some((event) => {
              return event.tick < currentTick && event.hostageEntityId === hostagePickUpStart.hostageEntityId;
            });
            // If an hostage has already been untied in the round even if a player doesn't have a kit it will take 1s to untie him.
            if (isHostageAlreadyUntied) {
              pickUpSecondsRequired = untieHostageWithKitDuration;
            }
          }
          const startPickingUpTick = currentTick - hostagePickUpStart.tick;
          const percentage = startPickingUpTick / (pickUpSecondsRequired * tickrate);
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * percentage;
          context.beginPath();
          context.fillStyle = 'rgb(242, 148, 35, 0.5)';
          context.arc(x, y, zoomedSize(14), startAngle, endAngle);
          context.lineTo(x, y);
          context.fill();
        }
      }

      if (position.isPlanting) {
        const bombPlantStart = bombsPlantStart.find((event) => event.tick < currentTick);
        if (bombPlantStart) {
          const startPlantingTick = currentTick - bombPlantStart.tick;
          const bombPlantDuration = 3.2;
          const percentage = startPlantingTick / (bombPlantDuration * tickrate);
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * percentage;
          context.beginPath();
          context.fillStyle = 'rgb(201, 37, 45, 0.5)';
          context.arc(x, y, zoomedSize(14), startAngle, endAngle);
          context.lineTo(x, y);
          context.fill();
        }
      }
    }
  };

  return { drawPlayers };
}
