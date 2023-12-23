import React from 'react';
import { Trans } from '@lingui/macro';
import { TextArea } from 'csdm/ui/components/inputs/text-area';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useSequenceForm } from './use-sequence-form';

export function CfgInput() {
  const { sequence, updateSequence } = useSequenceForm();
  const onBlur = (event: React.FocusEvent) => {
    const input = event.target as HTMLInputElement;
    updateSequence({
      cfg: input.value,
    });
  };

  return (
    <div className="flex flex-col gap-y-8 w-[300px] h-[300px]">
      <InputLabel htmlFor="cfg">
        <Trans context="Input label">CFG</Trans>
      </InputLabel>
      <TextArea
        id="cfg"
        defaultValue={sequence.cfg}
        placeholder="CFG executed at the beginning of the sequence. &#10;&#10;Example: &#10;cl_draw_only_deathnotices 0"
        resizable={false}
        spellCheck={false}
        onBlur={onBlur}
      />
    </div>
  );
}
