import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useSequenceForm } from './use-sequence-form';

export function ShowOnlyDeathNoticesCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSequence({
      showOnlyDeathNotices: event.target.checked,
    });
  };

  return (
    <Checkbox
      label={<Trans context="Input label">Show only death notices</Trans>}
      onChange={onChange}
      isChecked={sequence.showOnlyDeathNotices}
    />
  );
}
