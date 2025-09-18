import React from 'react';
import { BarsIcon } from 'csdm/ui/icons/bars-icon';

export function MenuButton() {
  return (
    <button
      className="flex h-full w-48 cursor-default items-center justify-center outline-hidden no-drag hover:bg-gray-300"
      onClick={() => {
        window.csdm.showTitleBarMenu();
      }}
    >
      <BarsIcon width={12} />
    </button>
  );
}
