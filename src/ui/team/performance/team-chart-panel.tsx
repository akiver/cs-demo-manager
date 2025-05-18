import React, { type ReactNode, type RefObject } from 'react';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';

type TeamChartPanelHeaderProps = {
  title: ReactNode;
  tooltip?: ReactNode;
};

export function TeamChartPanelHeader({ title, tooltip }: TeamChartPanelHeaderProps) {
  return (
    <div className="flex items-center gap-x-12 mb-8">
      <h3 className="text-body-strong">{title}</h3>
      {tooltip && (
        <Tooltip content={<p>{tooltip}</p>}>
          <div className="flex items-center justify-center rounded-full bg-gray-400 p-4 size-20">
            <QuestionIcon className="size-12" />
          </div>
        </Tooltip>
      )}
    </div>
  );
}

type TeamChartProps = {
  ref: RefObject<HTMLDivElement | null>;
};

export function TeamChart({ ref }: TeamChartProps) {
  return <div className="min-h-[280px] min-w-[400px]" ref={ref} />;
}

type Props = {
  children: ReactNode;
};

export function TeamChartPanel({ children }: Props) {
  return <div className="flex flex-col border border-gray-300 bg-gray-100 rounded p-8">{children}</div>;
}
