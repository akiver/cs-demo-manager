import React, { type ReactNode } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { CheckIcon } from 'csdm/ui/icons/check-icon';
import { ChevronDownIcon } from 'csdm/ui/icons/chevron-down-icon';

export type SelectOption<ValueType extends string | number = string> = {
  value: ValueType;
  label: ReactNode;
};

type Props<ValueType extends string | number = string> = {
  id?: string;
  isDisabled?: boolean;
  options: SelectOption<ValueType>[];
  value?: ValueType;
  label?: ReactNode;
  onChange: (value: ValueType) => void;
};

export function Select<ValueType extends string | number = string>({
  options,
  value,
  onChange,
  isDisabled = false,
  id,
  label,
}: Props<ValueType>) {
  return (
    <BaseSelect.Root
      id={id}
      items={options}
      value={value}
      onValueChange={(newValue) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      disabled={isDisabled}
      multiple={false}
    >
      {label && <BaseSelect.Label className="cursor-default">{label}</BaseSelect.Label>}
      <BaseSelect.Trigger className="flex h-30 w-full items-center rounded-4 border border-gray-400 bg-gray-50 pr-8 pl-12 outline-hidden not-data-disabled:hover:border-gray-900 focus:border-gray-900 data-disabled:bg-gray-400">
        <BaseSelect.Value className="flex-1 text-left" />
        <BaseSelect.Icon className="ml-4 flex items-center">
          <ChevronDownIcon className="size-16" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-select outline-hidden" sideOffset={4} alignItemWithTrigger={false}>
          <BaseSelect.Popup className="max-h-[min(24rem,var(--available-height))] min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-4 border border-gray-400 bg-gray-50 py-4 shadow-lg transition-[transform,scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <BaseSelect.List className="outline-hidden">
              {options.map((option) => {
                return (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-8 py-4 pr-16 pl-10 outline-hidden select-none data-highlighted:bg-gray-300"
                  >
                    <BaseSelect.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-12" />
                    </BaseSelect.ItemIndicator>
                    <BaseSelect.ItemText className="col-start-2">{option.label}</BaseSelect.ItemText>
                  </BaseSelect.Item>
                );
              })}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
