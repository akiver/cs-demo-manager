import React, { useEffect, useState } from 'react';
import type { PlayerColor } from 'csdm/common/types/counter-strike';
import { getPlayerColorBorderClassName } from 'csdm/ui/styles/get-player-color-border-class-name';

type Props = {
  avatarUrl: string | null;
  playerName?: string;
  playerColor?: PlayerColor;
  size?: number;
};

export function Avatar({ avatarUrl, playerName, playerColor, size }: Props) {
  const defaultAvatarPath = window.csdm.getDefaultPlayerAvatar();
  const [src, setSrc] = useState(avatarUrl);

  useEffect(() => {
    setSrc(avatarUrl);
  }, [avatarUrl]);

  const onError = () => {
    setSrc(defaultAvatarPath);
  };

  return (
    <img
      className={`border ${playerColor ? getPlayerColorBorderClassName(playerColor) : 'border-gray-300'} size-[100px]`}
      style={{
        width: size,
        height: size,
      }}
      title={playerName}
      src={src || defaultAvatarPath}
      onError={onError}
    />
  );
}
