import React, { useState } from 'react';

type Props = {
  url: string | null;
  playerName: string;
};

export function AccountAvatar({ url, playerName }: Props) {
  const [src, setSrc] = useState(url || window.csdm.getDefaultPlayerAvatar());

  return (
    <img
      className="w-32"
      src={src}
      alt={playerName}
      title={playerName}
      onError={() => {
        setSrc(window.csdm.getDefaultPlayerAvatar());
      }}
    />
  );
}
