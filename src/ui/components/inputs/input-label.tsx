import type { ReactNode } from 'react';
import React, { forwardRef } from 'react';
import { Tooltip } from '../tooltip';
import { LockIcon } from 'csdm/ui/icons/lock-icon';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';

type Props = {
  htmlFor?: string | undefined;
  isDisabled?: boolean;
  children: ReactNode;
  helpTooltip?: string | ReactNode;
};

export const InputLabel = forwardRef(function InputLabel(
  { children, isDisabled = false, helpTooltip, ...props }: Props,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div className="flex items-center gap-x-8">
      <label {...props}>{children}</label>
      {isDisabled && <LockIcon height={12} />}
      {helpTooltip !== undefined && (
        <Tooltip content={helpTooltip}>
          <div ref={ref}>
            <QuestionIcon height={12} />
          </div>
        </Tooltip>
      )}
    </div>
  );
});
