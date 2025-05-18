import type { ReactNode } from 'react';
import React from 'react';

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
    <p className={`text-gray-900 selectable ${variant === PanelValueVariant.Big ? 'text-title' : ''}`}>{children}</p>
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
      className={`flex flex-col min-w-[152px] border border-gray-300 bg-gray-75 rounded p-8 ${overflowX ? 'overflow-x-auto' : ''} ${
        fitHeight ? 'h-fit' : 'h-auto'
      }`}
      style={{
        minWidth,
      }}
    >
      {typeof header === 'string' ? <PanelTitle>{header}</PanelTitle> : header}
      {children && <div className="flex flex-col h-full justify-end mt-12">{children}</div>}
    </div>
  );
}
