import { useEffect, useState } from 'react';
import { SHOW_COMMENT_SHORTCUT } from 'csdm/ui/keyboard/keyboard-shortcut';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function useTableCommentWidgetVisibility() {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  const showWidget = () => {
    setIsWidgetVisible(true);
  };

  const hideWidget = () => {
    setIsWidgetVisible(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isCtrlOrCmdEvent(event) && event.key.toUpperCase() === SHOW_COMMENT_SHORTCUT.key) {
      setIsWidgetVisible((isVisible) => !isVisible);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hideWidget();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return { isWidgetVisible, showWidget, hideWidget, onKeyDown };
}
