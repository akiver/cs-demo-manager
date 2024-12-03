import type { ReactNode } from 'react';
import React from 'react';
import { Trans } from '@lingui/react/macro';

type Props = {
  name: string;
  websiteLink: string;
  version?: string;
  children: ReactNode;
};

export function Software({ name, version, websiteLink, children }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-x-8">
        <a href={websiteLink} target="_blank" rel="noreferrer" className="underline">
          {name}
        </a>
        <p>{version ?? <Trans context="Software installation status">Not installed</Trans>}</p>
      </div>
      <div className="flex mt-8 gap-x-8">{children}</div>
    </div>
  );
}
