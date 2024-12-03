import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { DemoType } from 'csdm/common/types/counter-strike';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { demosTypeUpdated } from '../demos-actions';

type Props = {
  checksums: string[];
};

export function UpdateDemosTypeItem({ checksums }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();

  const updateDemosType = async (type: DemoType) => {
    try {
      await client.send({
        name: RendererClientMessageName.UpdateDemosType,
        payload: {
          checksums,
          type,
        },
      });
      dispatch(demosTypeUpdated({ checksums, type }));
    } catch (error) {
      showToast({
        id: 'update-demos-type-error',
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
        <Trans>GOTV</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onPovClick}>
        <Trans>POV</Trans>
      </ContextMenuItem>
    </SubContextMenu>
  );
}
