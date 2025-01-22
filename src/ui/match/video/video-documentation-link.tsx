import React from 'react';
import { Trans } from '@lingui/react/macro';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';
import { Tooltip } from 'csdm/ui/components/tooltip';

export function VideoDocumentationLink() {
  return (
    <Tooltip
      placement="left"
      content={
        <p>
          <Trans context="Link">Documentation</Trans>
        </p>
      }
    >
      <a href="https://cs-demo-manager.com/docs/guides/video" target="_blank" rel="noreferrer" className="ml-auto">
        <QuestionIcon className="size-16" />
      </a>
    </Tooltip>
  );
}
