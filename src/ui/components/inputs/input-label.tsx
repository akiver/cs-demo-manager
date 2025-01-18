import type { ReactNode } from 'react';
import React from 'react';
import { Tooltip } from '../tooltip';
import { LockIcon } from 'csdm/ui/icons/lock-icon';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';

type Props = {
  htmlFor?: string | undefined;
  isDisabled?: boolean;
  children: ReactNode;
  helpTooltip?: string | ReactNode;
};

export function InputLabel({ children, isDisabled = false, helpTooltip, ...props }: Props) {
  return (
    <div className="flex items-center gap-x-8">
      <label {...props}>{children}</label>
      {isDisabled && <LockIcon height={12} />}
      {helpTooltip !== undefined && (
        <Tooltip content={helpTooltip}>
          <QuestionIcon height={12} />
        </Tooltip>
      )}
    </div>
  );
}
