import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { TextArea } from 'csdm/ui/components/inputs/text-area';

type Props = {
  cfg: string | undefined;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

export function CfgInput({ cfg, onBlur }: Props) {
  const { t } = useLingui();

  return (
    <TextArea
      id="cfg"
      defaultValue={cfg}
      placeholder={t({
        id: 'video-cfg-placeholder',
        context: 'Input placeholder',
        message: `CFG executed at the beginning of the sequence.\n\nExample:\ncl_draw_only_deathnotices 0`,
      })}
      resizable={false}
      spellCheck={false}
      onBlur={onBlur}
    />
  );
}
