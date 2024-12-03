import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoType } from 'csdm/common/types/counter-strike';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { matchesTypeUpdated } from 'csdm/ui/matches/matches-actions';

type Props = {
  checksums: string[];
};

export function ChangeMatchesTypeItem({ checksums }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();

  const updateDemosType = async (type: DemoType) => {
    try {
      await client.send({
        name: RendererClientMessageName.UpdateMatchesType,
        payload: {
          checksums,
          type,
        },
      });
      dispatch(matchesTypeUpdated({ checksums, type }));
    } catch (error) {
      showToast({
        id: 'update-matches-type-error',
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  const onGotvClick = () => {
    updateDemosType(DemoType.GOTV);
  };

  const onPovClick = () => {
    updateDemosType(DemoType.POV);
  };

  return (
    <SubContextMenu label={<Trans context="Context menu">Change type</Trans>}>
      <ContextMenuItem onClick={onGotvClick}>
        <Trans context="Context menu">GOTV</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onPovClick}>
        <Trans context="Context menu">POV</Trans>
      </ContextMenuItem>
    </SubContextMenu>
  );
}
