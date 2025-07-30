import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useIsHlaeEnabled } from './hlae/use-is-hlae-enabled';

type Props = {
  value: number;
  onBlur?: (value: number) => void;
};

export function DeathNoticesDurationInput({ value, onBlur }: Props) {
  const [duration, setDuration] = useState<string>(String(value));
  const isHlaeEnabled = useIsHlaeEnabled();

  if (!isHlaeEnabled) {
    return null;
  }

  const handleOnBlur = () => {
    onBlur?.(parseInt(duration, 10));
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(event.target.value);
  };

  return (
    <InputNumber
      name="death-notices-duration"
      label={<Trans>Death notices duration (seconds)</Trans>}
      min={0}
      onChange={onChange}
      value={duration}
      onBlur={handleOnBlur}
    />
  );
}
