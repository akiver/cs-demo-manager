import React from 'react';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { UpdateDemoLocationDialog } from 'csdm/ui/dialogs/update-demo-location-dialog';
import { SeeDemoButton as CommonSeeDemoButton } from 'csdm/ui/components/buttons/see-demo-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

export function SeeDemoButton() {
  const match = useCurrentMatch();
  const navigateToDemo = useNavigateToDemo();
  const { showDialog } = useDialog();

  const onClick = async () => {
    const demoExists = await window.csdm.pathExists(match.demoFilePath);
    if (demoExists) {
      navigateToDemo(match.demoFilePath);
    } else {
      showDialog(<UpdateDemoLocationDialog checksum={match.checksum} demoFilePath={match.demoFilePath} />);
    }
  };

  return <CommonSeeDemoButton onClick={onClick} />;
}
