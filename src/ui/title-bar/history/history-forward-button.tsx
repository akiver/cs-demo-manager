import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { HistoryButton } from './history-button';
import { RightArrowIcon } from 'csdm/ui/icons/right-arrow-icon';

export function HistoryForwardButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const onLocationChanged = async () => {
      const canGoForward: boolean = await window.csdm.canGoForward();
      setCanGoForward(canGoForward);
    };

    onLocationChanged();
  }, [location]);

  const onClick = () => {
    navigate(1);
  };

  const isDisabled = !canGoForward;

  return (
    <HistoryButton
      onClick={onClick}
      isDisabled={isDisabled}
      tooltip={<Trans context="Tooltip">Forward in history</Trans>}
    >
      <RightArrowIcon height={20} />
    </HistoryButton>
  );
}
