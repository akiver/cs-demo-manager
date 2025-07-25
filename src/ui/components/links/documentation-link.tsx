import React from 'react';
import { Trans } from '@lingui/react/macro';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  url: string;
};

export function DocumentationLink({ url }: Props) {
  return (
    <Tooltip
      placement="left"
      content={
        <p>
          <Trans context="Link">Documentation</Trans>
        </p>
      }
    >
      <a href={url} target="_blank" rel="noreferrer">
        <QuestionIcon className="size-16" />
      </a>
    </Tooltip>
  );
}
