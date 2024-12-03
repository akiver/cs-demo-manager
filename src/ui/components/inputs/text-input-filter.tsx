import React, { useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react/macro';
import { select } from '@lingui/core/macro';
import type { TextInputHandlers } from 'csdm/ui/components/inputs/text-input';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

type Props = {
  onChange: (text: string) => void;
  value: string;
  isDisabled?: boolean;
};

export function TextInputFilter({ value, onChange, isDisabled }: Props) {
  const ref = useRef<TextInputHandlers>(null);
  const { t } = useLingui();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Escape') {
        ref.current?.blur();
      } else if (key === 'f' && isCtrlOrCmdEvent(event)) {
        ref.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div>
      <TextInput
        ref={ref}
        type="search"
        placeholder={t({
          context: 'Input placeholder',
          message: select(window.csdm.platform, {
            darwin: 'Filter… (⌘+F)',
            other: 'Filter… (CTRL+F)',
          }),
        })}
        onChange={handleChange}
        value={value}
        isDisabled={isDisabled}
      />
    </div>
  );
}
