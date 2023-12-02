import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { ArmorIndicator } from './armor-indicator';
import { BombIndicator } from './bomb-indicator';
import { getTeamColor } from '../../../styles/get-team-color';
import { EliminationIcon } from 'csdm/ui/icons/elimination-icon';

function Circle({ className, children, ...props }: React.SVGProps<SVGCircleElement>) {
  return (
    <circle className={`transition-stroke-dashoffset duration-850 ease-in-out ${className}`} {...props}>
      {children}
    </circle>
  );
}
const ArmorCircle = Circle;
const HealthBackgroundCircle = Circle;
const HealthCircle = Circle;

type Props = {
  health: number;
  armor: number;
  hasHelmet: boolean;
  hasBomb: boolean;
  isAlive: boolean;
  side: TeamNumber;
};

export function HealthArmorState({ health, armor, hasHelmet, hasBomb, side, isAlive }: Props) {
  const blockSize = 50;
  const strokeWidth = 2;

  const armorCircleRadius = blockSize / 2 - strokeWidth / 2;
  const armorCircleCircumference = 2 * Math.PI * armorCircleRadius;
  const armorCircleOffset = armorCircleCircumference - (armor / 100) * armorCircleCircumference;

  const healthCircleRadius = armorCircleRadius - 4;
  const healthCircleCircumference = 2 * Math.PI * healthCircleRadius;
  const healthCircleOffset = healthCircleCircumference - (health / 100) * healthCircleCircumference;

  const skullIconSize = 20;
  const skullCenter = (blockSize - skullIconSize) / 2;
  const center = blockSize / 2;

  return (
    <div>
      <svg
        width={blockSize}
        height={blockSize}
        style={{
          transform: `rotate(-90deg) ${center} ${center}`,
        }}
      >
        <ArmorCircle
          fill="transparent"
          className="stroke-gray-900"
          cx={center}
          cy={center}
          r={armorCircleRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={armorCircleCircumference}
          strokeDashoffset={armorCircleOffset}
        />
        <HealthBackgroundCircle
          className="stroke-gray-400"
          cx={center}
          cy={center}
          r={healthCircleRadius}
          strokeWidth={strokeWidth}
        />
        <HealthCircle
          className="fill-gray-50"
          stroke={getTeamColor(side)}
          cx={center}
          cy={center}
          r={healthCircleRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={healthCircleCircumference}
          strokeDashoffset={healthCircleOffset}
        />
        {isAlive ? (
          <text x={center} y={center} alignmentBaseline="middle" textAnchor="middle">
            {health}
          </text>
        ) : (
          <EliminationIcon height={skullIconSize} width={skullIconSize} x={skullCenter} y={skullCenter} opacity={0.5} />
        )}
      </svg>
      {isAlive && <ArmorIndicator armor={armor} hasHelmet={hasHelmet} />}
      {hasBomb && <BombIndicator />}
    </div>
  );
}
