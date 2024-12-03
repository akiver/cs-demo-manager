import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { DemoField } from './demo-field';
import { useGetDemoSourceName } from 'csdm/ui/demos/use-demo-sources';

type Props = {
  source: DemoSource;
};

export function Source({ source }: Props) {
  const getDemoSourceName = useGetDemoSourceName();

  return <DemoField label={<Trans>Source:</Trans>} value={getDemoSourceName(source)} />;
}
