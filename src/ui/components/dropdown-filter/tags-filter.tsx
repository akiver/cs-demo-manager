import React, { type ReactNode } from 'react';
import { useTags } from 'csdm/ui/tags/use-tags';
import { Trans } from '@lingui/react/macro';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';

function ColorIndicator({ color }: { color: string }) {
  return (
    <div
      className="size-12 rounded-full border border-gray-300"
      style={{
        backgroundColor: color,
      }}
    />
  );
}

type Props = {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  hasActiveFilter: boolean;
  title?: ReactNode;
};

export function TagsFilter({ selectedTagIds, onChange, hasActiveFilter, title }: Props) {
  const tags = useTags();

  const onSelectAllClick = () => {
    const tagIds = tags.map((tag) => tag.id);
    onChange(tagIds);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={title ?? <Trans context="Tags filter label">Tags</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        const onClick = () => {
          const newSelectedTagIds = isSelected
            ? selectedTagIds.filter((id) => id !== tag.id)
            : [...selectedTagIds, tag.id];

          onChange(newSelectedTagIds);
        };
        return (
          <FilterValue key={tag.id} isSelected={isSelected} onClick={onClick}>
            <div className="flex items-center gap-x-8">
              <ColorIndicator color={tag.color} />
              <span>{tag.name}</span>
            </div>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
