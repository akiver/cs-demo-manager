import React, { useState } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { SelectOption } from '../inputs/select';
import { Select } from '../inputs/select';
import { Status } from 'csdm/common/types/status';
import { useDemoSources } from 'csdm/ui/demos/use-demo-sources';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { demosSourceUpdated } from 'csdm/ui/demos/demos-actions';
import type { UpdateDemosSourcePayload } from 'csdm/server/handlers/renderer-process/demo/update-demos-source-handler';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from '../toasts/use-show-toast';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

type Props = {
  checksums: string[];
  initialSource: DemoSource | undefined;
};

export function ChangeDemosSourceDialog({ checksums, initialSource }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const [source, setSource] = useState<DemoSource | undefined>(initialSource);
  const [status, setStatus] = useState<Status>(Status.Idle);
  const dispatch = useDispatch();
  const demoCount = checksums.length;
  const demoSources = useDemoSources();
  const options: SelectOption<DemoSource>[] = demoSources.map((source) => {
    return {
      value: source.value,
      label: source.name,
    };
  });
  const { hideDialog } = useDialog();

  const onConfirmClick = async () => {
    if (source === undefined) {
      return;
    }

    try {
      const payload: UpdateDemosSourcePayload = {
        checksums,
        source,
      };
      await client.send({
        name: RendererClientMessageName.UpdateDemosSource,
        payload,
      });
      setStatus(Status.Loading);
      showToast({
        content: <Plural value={demoCount} one="# demo updated" other="# demos updated" />,
        id: 'update-demos',
        type: 'success',
      });

      dispatch(
        demosSourceUpdated({
          checksums,
          source,
        }),
      );
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'update-demos',
        type: 'error',
      });
    } finally {
      hideDialog();
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Update source</Trans>}
      onConfirm={onConfirmClick}
      isBusy={status === Status.Loading}
      isConfirmButtonDisabled={initialSource !== undefined && initialSource === source}
    >
      <div className="flex flex-col gap-y-8 max-w-[600px]">
        <div className="flex items-center gap-x-4">
          <ExclamationTriangleIcon className="size-16 text-red-700 shrink-0" />
          <p>
            <Trans>
              Change it only if the source is unknown or incorrect in the app! (for instance Valve instead of FACEIT)
            </Trans>
          </p>
        </div>

        <div className="flex items-center gap-x-4">
          <ExclamationTriangleIcon className="size-16 text-orange-700 shrink-0" />
          <p className="text-caption">
            <Trans>Changing a demo's source require to re-analyze it to update its match data!</Trans>
          </p>
        </div>

        <div className="mt-4 mx-auto">
          <Select
            options={options}
            value={source}
            onChange={(selectedSource) => {
              setSource(selectedSource);
            }}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
