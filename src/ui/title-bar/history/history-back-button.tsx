import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { HistoryButton } from './history-button';
import { LeftArrowIcon } from 'csdm/ui/icons/left-arrow-icon';

export function HistoryBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const onLocationChanged = async () => {
      const canGoBack: boolean = await window.csdm.canGoBack();
      setCanGoBack(canGoBack);
    };

    onLocationChanged();
  }, [location]);

  const onClick = () => {
    navigate(-1);
  };
  const isDisabled = !canGoBack;

  return (
    <HistoryButton onClick={onClick} isDisabled={isDisabled} tooltip={<Trans context="Tooltip">Back in history</Trans>}>
      <LeftArrowIcon height={20} />
    </HistoryButton>
  );
}
