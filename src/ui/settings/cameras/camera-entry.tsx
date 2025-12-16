import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import type { Camera } from 'csdm/common/types/camera';
import { useGetCameraImageSrc } from 'csdm/ui/cameras/use-get-camera-image-src';
import { CameraFormProvider, type CameraFormValues } from './form/camera-form-provider';
import { DeleteCameraDialog } from './delete-camera-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { EditCameraDialog } from './edit-camera-dialog';
import { KebabMenu, KebabMenuItem } from 'csdm/ui/components/kebab-menu';

type Props = {
  camera: Camera;
};

export function CameraEntry({ camera }: Props) {
  const getCameraImageSrc = useGetCameraImageSrc();
  const { showDialog } = useDialog();
  const showToast = useShowToast();
  const { t } = useLingui();

  return (
    <div className="w-[294px] rounded border border-gray-300">
      <img src={getCameraImageSrc(camera.id)} alt={camera.name} />
      <div className="p-8">
        <div className="flex items-center gap-x-8">
          <div className="size-10 min-w-10 rounded-full" style={{ backgroundColor: camera.color }} />
          <p className="line-clamp-2" title={camera.name}>
            {camera.name}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-8">
            <Button
              onClick={async () => {
                const previewBase64 = await window.csdm.getCameraPreviewBase64(camera.id);
                const initialValues: CameraFormValues = {
                  name: camera.name,
                  x: String(camera.x),
                  y: String(camera.y),
                  z: String(camera.z),
                  pitch: String(camera.pitch),
                  yaw: String(camera.yaw),
                  comment: String(camera.comment),
                  color: camera.color,
                  previewBase64,
                };
                showDialog(
                  <CameraFormProvider
                    id={camera.id}
                    game={camera.game}
                    mapName={camera.mapName}
                    initialValues={initialValues}
                  >
                    <EditCameraDialog id={camera.id} />
                  </CameraFormProvider>,
                );
              }}
            >
              <Trans context="Button">Edit</Trans>
            </Button>
            <DeleteButton
              onClick={() => {
                showDialog(<DeleteCameraDialog cameraId={camera.id} />);
              }}
            />
            <div className="h-30">
              <KebabMenu label={t`Camera actions`}>
                <KebabMenuItem
                  onClick={async () => {
                    const command = `spec_goto ${camera.x} ${camera.y} ${camera.z} ${camera.pitch} ${camera.yaw}`;
                    await navigator.clipboard.writeText(command);
                    showToast({
                      type: 'success',
                      content: <Trans>spec_goto command copied to clipboard</Trans>,
                    });
                  }}
                >
                  <Trans>Copy spec_goto command</Trans>
                </KebabMenuItem>
              </KebabMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
