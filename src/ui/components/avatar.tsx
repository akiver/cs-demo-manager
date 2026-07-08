import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
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
  const avatarSrc = avatarUrl || defaultAvatarPath;
  const [src, setSrc] = useState(avatarSrc);

  useEffect(() => {
    setSrc(avatarSrc);
  }, [avatarSrc]);

  const onError = () => {
    setSrc(defaultAvatarPath);
  };

  return (
    <img
      className={clsx(
        'size-[100px] border',
        playerColor ? getPlayerColorBorderClassName(playerColor) : 'border-gray-300',
      )}
      style={{
        width: size,
        height: size,
      }}
      title={playerName}
      src={src}
      onError={onError}
    />
  );
}
