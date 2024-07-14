import React from 'react';
import { TextArea } from 'csdm/ui/components/inputs/text-area';

type Props = {
  cfg: string | undefined;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

export function CfgInput({ cfg, onBlur }: Props) {
  return (
    <TextArea
      id="cfg"
      defaultValue={cfg}
      placeholder="CFG executed at the beginning of the sequence. &#10;&#10;Example: &#10;cl_draw_only_deathnotices 0"
      resizable={false}
      spellCheck={false}
      onBlur={onBlur}
    />
  );
}
