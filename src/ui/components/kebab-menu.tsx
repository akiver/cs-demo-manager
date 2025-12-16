import React, { type ReactNode } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { EllipsisVerticalIcon } from '../icons/ellipsis-vertical-icon';

function Arrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-gray-100"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-none"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-gray-500"
      />
    </svg>
  );
}

type MenuItemProps = {
  children: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
};

export function KebabMenuItem({ children, isDisabled, onClick }: MenuItemProps) {
  return (
    <BaseMenu.Item
      onClick={onClick}
      disabled={isDisabled}
      className="flex h-32 items-center rounded px-16 leading-none opacity-100 select-none data-disabled:opacity-50 data-highlighted:bg-gray-200 data-highlighted:text-gray-900 data-disabled:data-highlighted:bg-transparent"
    >
      {children}
    </BaseMenu.Item>
  );
}

type Props = {
  children: ReactNode;
  label: string;
};

export function KebabMenu({ children, label }: Props) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        aria-label={label}
        className="flex h-full w-24 cursor-pointer items-center justify-center rounded-4 transition-colors duration-200 hover:bg-gray-300 hover:text-gray-900 data-popup-open:bg-gray-300 data-popup-open:text-gray-900"
      >
        <EllipsisVerticalIcon className="h-full" />
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner className="z-menu-item outline-none" sideOffset={8}>
          <BaseMenu.Popup className="rounded-8 border border-gray-500 bg-gray-100 p-4 transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
            <BaseMenu.Arrow className="data-[side=bottom]:-top-8 data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-8 data-[side=top]:rotate-180">
              <Arrow className="h-10 w-20" />
            </BaseMenu.Arrow>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
