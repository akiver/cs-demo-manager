import React from 'react';
import { Trans } from '@lingui/react/macro';
import { OptionCard } from 'csdm/ui/components/inputs/option-card';
import { RadioGroup } from 'csdm/ui/components/inputs/radio/radio-group';
import { DatabaseMode } from 'csdm/common/types/database-mode';

type Props = {
  mode: DatabaseMode;
  onChange: (mode: DatabaseMode) => void;
  isDisabled?: boolean;
  ariaLabelledBy?: string;
};

export function DatabaseModeOptionCards({ mode, onChange, isDisabled, ariaLabelledBy }: Props) {
  return (
    <RadioGroup<DatabaseMode> value={mode} onChange={onChange} isDisabled={isDisabled} ariaLabelledBy={ariaLabelledBy}>
      <OptionCard
        value={DatabaseMode.Embedded}
        title={<Trans>Embedded (recommended)</Trans>}
        description={<Trans>Managed by CS Demo Manager, nothing to install.</Trans>}
      />
      <OptionCard
        value={DatabaseMode.External}
        title={<Trans>External server</Trans>}
        description={<Trans>Use your own PostgreSQL server, local or remote.</Trans>}
      />
    </RadioGroup>
  );
}
