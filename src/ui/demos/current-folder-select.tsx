import React from 'react';
import { Trans } from '@lingui/macro';
import { Select } from 'csdm/ui/components/inputs/select';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useDemosSettings } from 'csdm/ui/settings/folders/use-demos-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useFolders } from 'csdm/ui/settings/folders/use-folders';
import { FolderIcon } from 'csdm/ui/icons/folder-icon';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useFetchDemos } from 'csdm/ui/demos/use-fetch-demos';

export function CurrentFolderSelect() {
  const folders = useFolders();
  const { currentFolderPath, showAllFolders } = useDemosSettings();
  const demosLoaded = useDemosLoaded();
  const updateSettings = useUpdateSettings();
  const fetchDemos = useFetchDemos();

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
      <Checkbox
        id="select-all-folders"
        label={<Trans context="Checkbox label">See all folders</Trans>}
        isChecked={showAllFolders}
        isDisabled={!demosLoaded || folders.length === 0}
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
