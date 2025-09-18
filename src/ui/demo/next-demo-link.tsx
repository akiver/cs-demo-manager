import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useLocation, useParams } from 'react-router';
import { buildDemoPath } from 'csdm/ui/routes-paths';
import { NextLink } from '../components/links';
import { modifierKey } from '../keyboard/keyboard-shortcut';

export function NextDemoLink() {
  const location = useLocation();
  const { path: currentDemoPath } = useParams<string>();
  if (currentDemoPath === undefined) {
    throw new Error('Current demo path not found');
  }
  const siblingDemoPaths: string[] = location.state?.siblingDemoPaths ?? [];
  const currentDemoIndex = siblingDemoPaths.indexOf(currentDemoPath);
  const nextDemoPath = siblingDemoPaths[currentDemoIndex + 1];
  const to = nextDemoPath === undefined ? '' : buildDemoPath(nextDemoPath);

  return <NextLink to={to} tooltip={<Trans>Next demo ({modifierKey}+→)</Trans>} />;
}
