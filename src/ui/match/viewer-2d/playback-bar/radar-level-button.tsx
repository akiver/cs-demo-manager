import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { CheckIcon } from 'csdm/ui/icons/check-icon';
import { MapIcon } from 'csdm/ui/icons/map-icon';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

type MenuEntryProps = {
  children: ReactNode;
  onClick: () => void;
  isChecked: boolean;
};

function MenuEntry({ children, isChecked, onClick }: MenuEntryProps) {
  return (
    <div className="flex items-center px-8 py-4 cursor-pointer hover:bg-gray-300 hover:text-gray-900" onClick={onClick}>
      <div className="flex justify-center w-20 pr-8">{isChecked && <CheckIcon height={16} />}</div>
      {children}
    </div>
  );
}

function RadarLevelMenu() {
  const { setRadarLevel, radarLevel } = useViewerContext();

  return (
    <div className="absolute flex flex-col right-0 bottom-40 bg-gray-100 w-[200px] cursor-default pb-8 rounded text-gray-800">
      <div className="flex items-center border-b border-b-gray-200 p-8">
        <p className="text-body-strong">
          <Trans>Radar level</Trans>
        </p>
      </div>
      <MenuEntry
        isChecked={radarLevel === RadarLevel.Upper}
        onClick={() => {
          setRadarLevel(RadarLevel.Upper);
        }}
      >
        <p>
          <Trans context="Map radar level">Upper</Trans>
        </p>
      </MenuEntry>
      <MenuEntry
        isChecked={radarLevel === RadarLevel.Lower}
        onClick={() => {
          setRadarLevel(RadarLevel.Lower);
        }}
      >
        <Trans context="Map radar level">Lower</Trans>
      </MenuEntry>
    </div>
  );
}

export function RadarLevelButton() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { map } = useViewerContext();

  if (map.lowerRadarFilePath === undefined) {
    return null;
  }

  return (
    <PlaybackBarButton
      onMouseEnter={() => {
        setIsMenuVisible(true);
      }}
      onMouseLeave={() => {
        setIsMenuVisible(false);
      }}
    >
      {isMenuVisible && <RadarLevelMenu />}
      <MapIcon />
    </PlaybackBarButton>
  );
}
