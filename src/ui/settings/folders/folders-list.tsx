import React from 'react';
import { FolderRow } from 'csdm/ui/settings/folders/folder-row';
import { useFolders } from './use-folders';

export function FoldersList() {
  const folders = useFolders();

  return (
    <div className="flex flex-col gap-y-12 mt-8">
      {folders.map((folder) => {
        return <FolderRow key={folder.path} folder={folder} />;
      })}
    </div>
  );
}
