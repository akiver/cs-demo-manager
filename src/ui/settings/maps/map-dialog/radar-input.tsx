import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { ImageDropZone } from 'csdm/ui/components/inputs/image-drop-zone';
import { useMapFormField } from './use-map-form-field';

export function RadarInput() {
  const { value, setField } = useMapFormField('radarBase64');
  const { t } = useLingui();

  const updateRadarFieldFromImageFilePath = async (imageFilePath: string) => {
    try {
      const png = await window.csdm.getImageInformation(imageFilePath);
      if (png.width !== png.height) {
        setField(value, t`The radar image must be a square.`);
        return;
      }

      setField(png.base64, undefined);
    } catch (error) {
      setField(value, t`Invalid PNG file.`);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { files } = event.dataTransfer;
    if (files.length > 0) {
      updateRadarFieldFromImageFilePath(window.csdm.getWebFilePath(files[0]));
    }
  };

  const selectRadarImageFile = async () => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ extensions: ['png'], name: t`PNG Files` }],
    };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }

    const [imagePath] = filePaths;
    updateRadarFieldFromImageFilePath(imagePath);
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Radar</Trans>
      </InputLabel>
      <ImageDropZone onDrop={onDrop} onClick={selectRadarImageFile} src={value} />
    </div>
  );
}
