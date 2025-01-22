import type { ReactNode } from 'react';
import React from 'react';
import { Tooltip } from '../tooltip';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';

type Props = {
  htmlFor?: string | undefined;
  children: ReactNode;
  helpTooltip?: string | ReactNode;
};

export function InputLabel({ children, helpTooltip, ...props }: Props) {
  return (
    <div className="flex items-center gap-x-8">
      <label {...props}>{children}</label>
      {helpTooltip !== undefined && (
        <Tooltip content={helpTooltip}>
          <QuestionIcon height={12} />
        </Tooltip>
      )}
    </div>
  );
}
