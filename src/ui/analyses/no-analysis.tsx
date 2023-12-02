import React from 'react';
import { Trans } from '@lingui/macro';
import { Message } from 'csdm/ui/components/message';

export function NoAnalysis() {
  return <Message message={<Trans>No demo analysis in progress.</Trans>} />;
}
