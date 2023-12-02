import React from 'react';
import ReactDOM from 'react-dom';
import type { SpringValue } from '@react-spring/web';
import { animated } from '@react-spring/web';
import { Settings } from './settings';
import { useBlockNavigation } from 'csdm/ui/hooks/use-block-navigation';

type Props = {
  onClose: () => void;
  style: {
    opacity: SpringValue<number>;
  };
};

export function SettingsOverlay({ onClose, style }: Props) {
  useBlockNavigation(true);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <animated.div
      className="absolute inset-0 z-1 bg-overlay focus-within:outline-none"
      style={style}
      onKeyDown={onKeyDown}
    >
      <Settings />
    </animated.div>,
    document.body,
  );
}
