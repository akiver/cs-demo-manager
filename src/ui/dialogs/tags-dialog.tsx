import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useTags } from 'csdm/ui/tags/use-tags';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { SaveButton } from '../components/buttons/save-button';
import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';

type Props = {
  defaultTagIds: string[];
  onTagIdsUpdated: (tagIds: string[]) => void;
};

export function TagsDialog({ defaultTagIds, onTagIdsUpdated }: Props) {
  const tags = useTags();
  const { hideDialog } = useDialog();
  const [selectedTags, setSelectedTags] = useState(defaultTagIds);

  const submit = () => {
    const changed = !areArraysValuesTheSame(selectedTags, defaultTagIds);
    if (changed) {
      onTagIdsUpdated(selectedTags);
    }
    hideDialog();
  };

  return (
    <Dialog onEnterPressed={submit}>
      <DialogHeader>
        <DialogTitle>
          <Trans>Tags</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="max-w-[524px] max-h-[300px] overflow-auto flex flex-wrap gap-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.some((tagId) => {
              return tagId === tag.id;
            });

            return (
              <div
                key={tag.id}
                className={`flex rounded border border-gray-300 hover:text-gray-900 cursor-default ${
                  isSelected
                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-400'
                    : 'bg-gray-200 text-gray-600 border-transparent'
                }`}
                onClick={() => {
                  const newSelectedTagIds = isSelected
                    ? selectedTags.filter((id) => id !== tag.id)
                    : [...selectedTags, tag.id];
                  setSelectedTags(newSelectedTagIds);
                }}
              >
                <div
                  className="w-12 rounded-l border-r"
                  style={{
                    backgroundColor: tag.color,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <p className="px-8 py-4">{tag.name}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogFooter>
        <SaveButton onClick={submit} />
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
