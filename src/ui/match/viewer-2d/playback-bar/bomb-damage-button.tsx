import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { ExplosionIcon } from 'csdm/ui/icons/explosion-icon';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { OpacityInput } from 'csdm/ui/components/inputs/opacity-input';
import { Popover, PopoverContent, PopoverTrigger } from 'csdm/ui/components/popover/popover';
import { Switch } from 'csdm/ui/components/inputs/switch';
import {
  BOMB_DAMAGE_BANDS,
  BOMB_DAMAGE_LETHAL_BAND,
  type BombDamageBand,
  toRgba,
} from '../bomb-damage/bomb-damage-colors';

function BandSwatch({ band }: { band: BombDamageBand }) {
  return (
    <span className="flex size-12 overflow-hidden rounded-4 bg-black">
      <span className="size-full" style={{ backgroundColor: toRgba(band.color, band.alpha) }} />
    </span>
  );
}

function ArmoredLethalSwatch() {
  return (
    <span
      className="size-12 rounded-full border-2 border-dashed"
      style={{ borderColor: toRgba(BOMB_DAMAGE_LETHAL_BAND.color, 0.9) }}
    />
  );
}

function LegendItem({ children }: { children: ReactNode }) {
  return <li className="flex items-center gap-x-8">{children}</li>;
}

function HurtLegendItems() {
  return BOMB_DAMAGE_BANDS.slice(1).map((band, index) => {
    const minDamage = band.minDamage;
    const maxDamage = BOMB_DAMAGE_BANDS[index].minDamage - 1;

    return (
      <LegendItem key={band.minDamage}>
        <BandSwatch band={band} />
        <Trans>
          {minDamage} to {maxDamage} HP of damage
        </Trans>
      </LegendItem>
    );
  });
}

function BakedLegend() {
  return (
    <ul className="flex flex-col gap-y-4 text-caption">
      <LegendItem>
        <BandSwatch band={BOMB_DAMAGE_LETHAL_BAND} />
        <Trans>Kills a player at 100 HP</Trans>
      </LegendItem>
      <HurtLegendItems />
    </ul>
  );
}

function LegacyLegend() {
  return (
    <ul className="flex flex-col gap-y-4 text-caption">
      <LegendItem>
        <BandSwatch band={BOMB_DAMAGE_LETHAL_BAND} />
        <Trans>Kills a player at 100 HP without armor</Trans>
      </LegendItem>
      <LegendItem>
        <ArmoredLethalSwatch />
        <Trans>Kills a player at 100 HP with armor</Trans>
      </LegendItem>
      <HurtLegendItems />
    </ul>
  );
}

function BombDamagePopover() {
  const { isBombDamageVisible, setIsBombDamageVisible, bombDamageOpacity, setBombDamageOpacity, bombDamageModel } =
    useViewerContext();

  return (
    <div className="flex max-w-[320px] flex-col gap-y-8 rounded-8 bg-gray-100 p-8">
      <p className="text-body-strong">
        <Trans>Bomb damage</Trans>
      </p>
      <div className="flex items-center justify-between gap-x-8">
        <label htmlFor="bomb-damage-visible" className="cursor-pointer">
          <Trans>Show the C4 blast zones once the bomb is planted</Trans>
        </label>
        <Switch id="bomb-damage-visible" isChecked={isBombDamageVisible} onChange={setIsBombDamageVisible} />
      </div>
      <OpacityInput value={bombDamageOpacity} onChange={setBombDamageOpacity} />
      {bombDamageModel === 'baked' ? <BakedLegend /> : <LegacyLegend />}
    </div>
  );
}

export function BombDamageButton() {
  const { shouldDrawBombs } = useViewerContext();

  if (!shouldDrawBombs) {
    return null;
  }

  return (
    <Popover openOnHover={true} closeDelay={300}>
      <PopoverTrigger asChild={true}>
        <PlaybackBarButton>
          <ExplosionIcon className="w-20" />
        </PlaybackBarButton>
      </PopoverTrigger>

      <PopoverContent>
        <BombDamagePopover />
      </PopoverContent>
    </Popover>
  );
}
