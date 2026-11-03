import React from 'react';
import { useTags } from 'csdm/ui/tags/use-tags';
import { AddTag } from './add-tag';
import { TagEntry } from './tag-entry';

export function TagsSettings() {
  const tags = useTags();
  return (
    <>
      <AddTag />
      <div className="mt-12 flex flex-col gap-y-8">
        {tags.map((tag) => {
          return <TagEntry key={tag.id} tag={tag} />;
        })}
      </div>
    </>
  );
}
