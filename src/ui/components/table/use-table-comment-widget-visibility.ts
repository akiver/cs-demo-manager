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
      if (!isWidgetVisible) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          hideWidget();
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          // temporarily hide the widget when navigating with arrow keys because the markdown editor can be heavy to
          // render, and so slowing down the navigation.
          const isWidgetTarget = event.target instanceof HTMLDivElement && event.target.contentEditable === 'true';
          if (isWidgetTarget) {
            break;
          }
          setIsWidgetVisible(false);
          document.addEventListener(
            'keyup',
            () => {
              setIsWidgetVisible(true);
            },
            { once: true },
          );
          break;
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isWidgetVisible]);

  return { isWidgetVisible, showWidget, hideWidget, onKeyDown };
}
