import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { RenameDemoPayload } from 'csdm/server/handlers/renderer-process/demo/rename-demo-handler';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { isEmptyString } from 'csdm/common/string/is-empty-string';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

type Props = {
  checksum: string;
  currentName: string;
};

export function DemoNameInput({ checksum, currentName }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const [name, setName] = useState<string>(currentName);

  const onBlur = async () => {
    const isNameValid = name !== currentName && !isEmptyString(name);
    if (!isNameValid) {
      return;
    }

    try {
      const payload: RenameDemoPayload = {
        checksum,
        name,
      };
      await client.send({
        name: RendererClientMessageName.RenameDemo,
        payload,
      });
      dispatch(demoRenamed({ checksum, name }));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'rename-demo-error',
        type: 'error',
      });
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return <TextInput label={<Trans>Name:</Trans>} value={name} onChange={onChange} onBlur={onBlur} />;
}
