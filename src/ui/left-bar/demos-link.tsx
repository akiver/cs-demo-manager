import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from 'csdm/ui/left-bar/left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { DemFileIcon } from 'csdm/ui/icons/dem-file-icon';

export function DemosLink() {
  return <LeftBarLink icon={<DemFileIcon />} tooltip={<Trans context="Tooltip">Demos</Trans>} url={RoutePath.Demos} />;
}
