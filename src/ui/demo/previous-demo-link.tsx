import React from 'react';
import { useLocation, useParams } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { buildDemoPath } from 'csdm/ui/routes-paths';
import { PreviousLink } from '../components/links';
import { modifierKey } from '../keyboard/keyboard-shortcut';

export function PreviousDemoLink() {
  const location = useLocation();
  const { path: currentDemoPath } = useParams<string>();
  if (currentDemoPath === undefined) {
    throw new Error('Current demo path not found');
  }
  const siblingDemoPaths: string[] = location.state?.siblingDemoPaths ?? [];
  const currentDemoIndex = siblingDemoPaths.indexOf(currentDemoPath);
  const previousDemoPath = siblingDemoPaths[currentDemoIndex - 1];
  const to = previousDemoPath === undefined ? '' : buildDemoPath(previousDemoPath);

  return <PreviousLink to={to} tooltip={<Trans>Previous demo ({modifierKey}+←)</Trans>} />;
}
