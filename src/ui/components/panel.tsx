import type { ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';

type TitleProps = {
  children: ReactNode;
};

export function PanelTitle({ children }: TitleProps) {
  return <p className="text-body-strong">{children}</p>;
}

export function PanelRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-x-16">{children}</div>;
}

export const PanelValueVariant = {
  Default: 'default',
  Big: 'big',
} as const;

export type PanelValueVariant = (typeof PanelValueVariant)[keyof typeof PanelValueVariant];

type PanelValueProps = {
  variant?: PanelValueVariant;
  children: ReactNode;
};

export function PanelValue({ children, variant = PanelValueVariant.Default }: PanelValueProps) {
  return (
    <p className={clsx('selectable text-gray-900', variant === PanelValueVariant.Big && 'text-title')}>{children}</p>
  );
}

type PanelStatRowProps = {
  title: ReactNode;
  value: number;
};

export function PanelStatRow({ title, value }: PanelStatRowProps) {
  return (
    <PanelRow>
      <p>{title}</p>
      <PanelValue>{value}</PanelValue>
    </PanelRow>
  );
}

type Props = {
  header: ReactNode | string;
  children?: ReactNode;
  fitHeight?: boolean;
  minWidth?: number;
  overflowX?: boolean;
};

export function Panel({ header, children, fitHeight, minWidth, overflowX = true }: Props) {
  return (
    <div
      className={clsx(
        'flex min-w-[152px] flex-col rounded border border-gray-300 bg-gray-75 p-8',
        fitHeight ? 'h-fit' : 'h-auto',
        overflowX && 'overflow-x-auto',
      )}
      style={{
        minWidth,
      }}
    >
      {typeof header === 'string' ? <PanelTitle>{header}</PanelTitle> : header}
      {children && <div className="mt-12 flex h-full flex-col justify-end">{children}</div>}
    </div>
  );
}
