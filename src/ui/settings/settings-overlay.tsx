import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { Settings } from './settings';
import { useBlockNavigation } from 'csdm/ui/hooks/use-block-navigation';
import { SETTINGS_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

type Props = {
  onClose: () => void;
};

export function SettingsOverlay({ onClose }: Props) {
  useBlockNavigation(true);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <motion.div
      className="absolute inset-0 z-1 bg-overlay focus-within:outline-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      onKeyDown={onKeyDown}
      id={SETTINGS_ELEMENT_ID}
    >
      <Settings />
    </motion.div>,
    document.body,
  );
}
