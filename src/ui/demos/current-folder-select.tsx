import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Select } from 'csdm/ui/components/inputs/select';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useDemosSettings } from 'csdm/ui/settings/folders/use-demos-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useFolders } from 'csdm/ui/settings/folders/use-folders';
import { FolderIcon } from 'csdm/ui/icons/folder-icon';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useFetchDemos } from 'csdm/ui/demos/use-fetch-demos';
import { useToggleFolderSubFoldersInclusion } from 'csdm/ui/settings/folders/use-toggle-folder-sub-folders-inclusion';

export function CurrentFolderSelect() {
  const folders = useFolders();
  const { currentFolderPath, showAllFolders } = useDemosSettings();
  const folder = folders.find((folder) => folder.path === currentFolderPath);
  const toggleFolderSubFoldersInclusion = useToggleFolderSubFoldersInclusion();
  const demosLoaded = useDemosLoaded();
  const updateSettings = useUpdateSettings();
  const fetchDemos = useFetchDemos();
  const canInteract = demosLoaded && folders.length > 0;

  return (
    <div className="flex items-center p-8 gap-12">
      <FolderIcon height={24} />
      <div className="flex flex-col w-full">
        <Select
          isDisabled={!demosLoaded || showAllFolders || folders.length === 0}
          onChange={async (selectedFolderPath) => {
            await updateSettings({
              demos: {
                currentFolderPath: selectedFolderPath,
              },
            });

            fetchDemos();
          }}
          value={currentFolderPath}
          options={folders.map((folder) => {
            return {
              value: folder.path,
              label: folder.path,
            };
          })}
        />
      </div>
      {folder && (
        <Checkbox
          label={<Trans context="Checkbox label">Include subfolders</Trans>}
          isChecked={folder.includeSubFolders}
          isDisabled={showAllFolders || !canInteract}
          onChange={async (event) => {
            await toggleFolderSubFoldersInclusion(folder.path, event.target.checked);
            await fetchDemos();
          }}
        />
      )}
      <Checkbox
        label={<Trans context="Checkbox label">See all folders</Trans>}
        isChecked={showAllFolders}
        isDisabled={!canInteract}
        onChange={async (event) => {
          const isChecked = event.target.checked;
          await updateSettings({
            demos: {
              showAllFolders: isChecked,
            },
          });
          fetchDemos();
        }}
      />
    </div>
  );
}
