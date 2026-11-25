import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useFormatTimeToDamage } from 'csdm/ui/hooks/use-format-time-to-damage';

function NotAvailableExplanation() {
  return (
    <p>
      <Trans>
        Only available for CS2 demos analyzed with the map geometry, analyze the demos again if they were analyzed with
        a previous version.
      </Trans>
    </p>
  );
}

type TimeToDamagePanelProps = {
  title: ReactNode;
  description: ReactNode;
  milliseconds: number | null;
};

function TimeToDamagePanel({ title, description, milliseconds }: TimeToDamagePanelProps) {
  const formatTimeToDamage = useFormatTimeToDamage();

  return (
    <Tooltip
      content={
        <div className="flex max-w-[300px] flex-col gap-y-4">
          <p>{description}</p>
          {milliseconds === null && <NotAvailableExplanation />}
        </div>
      }
    >
      <div>
        <Panel
          fitHeight={true}
          header={
            <>
              <PanelTitle>{title}</PanelTitle>
              <PanelValue variant={PanelValueVariant.Big}>{formatTimeToDamage(milliseconds)}</PanelValue>
            </>
          }
        />
      </div>
    </Tooltip>
  );
}

type Props = {
  milliseconds: number | null;
};

export function AverageTimeToDamagePanel({ milliseconds }: Props) {
  return (
    <TimeToDamagePanel
      title={<Trans context="Panel title">Avg time to damage</Trans>}
      description={
        <Trans>Average time between the moment the player saw an enemy and the moment they damaged them.</Trans>
      }
      milliseconds={milliseconds}
    />
  );
}

export function AverageTimeToKillPanel({ milliseconds }: Props) {
  return (
    <TimeToDamagePanel
      title={<Trans context="Panel title">Avg time to kill</Trans>}
      description={
        <Trans>Average time between the moment the player saw an enemy and the moment they killed them.</Trans>
      }
      milliseconds={milliseconds}
    />
  );
}
