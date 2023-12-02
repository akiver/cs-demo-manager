import React, { useState } from 'react';
import type { PlayerColor } from 'csdm/common/types/counter-strike';
import { getPlayerColorBorderClassName } from 'csdm/ui/styles/get-player-color-border-class-name';

type Props = {
  avatarUrl: string | null;
  playerName: string;
  playerColor?: PlayerColor;
};

export function AvatarCell({ avatarUrl, playerName, playerColor }: Props) {
  const [src, setSrc] = useState(avatarUrl || window.csdm.getDefaultPlayerAvatar());

  return (
    <img
      src={src}
      className={playerColor ? `border ${getPlayerColorBorderClassName(playerColor)}` : undefined}
      alt={playerName}
      title={playerName}
      onError={() => {
        setSrc(window.csdm.getDefaultPlayerAvatar());
      }}
    />
  );
}
