import React from 'react';
import { Trans, msg } from '@lingui/macro';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { ImageDragZone } from './image-drop-zone';
import { DragIcon } from 'csdm/ui/icons/drag-icon';
import { useMapFormField } from './use-map-form-field';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function LowerRadarInput() {
  const { value, setField } = useMapFormField('lowerRadarBase64');
  const _ = useI18n();

  const updateLowerRadarFieldFromImageFilePath = async (imageFilePath: string) => {
    try {
      const fileWidth = 1024;
      const fileHeight = 1024;
      const png = await window.csdm.getPngInformation(imageFilePath);
      if (png.width !== fileWidth || png.height !== fileHeight) {
        setField(value, _(msg`Radar image size must be ${fileWidth}x${fileHeight}.`));
        return;
      }
      setField(png.base64, undefined);
    } catch (error) {
      setField(value, _(msg`Invalid PNG file.`));
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files: FileList = event.dataTransfer.files;
    if (files.length > 0) {
      updateLowerRadarFieldFromImageFilePath(files[0].path);
    }
  };

  const selectRadarImageFile = async () => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ extensions: ['png'], name: 'PNG Files' }],
    };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }

    const [imagePath] = filePaths;
    updateLowerRadarFieldFromImageFilePath(imagePath);
  };

  return (
    <div className="flex flex-col">
      <InputLabel>
        <Trans context="Input label">Lower radar</Trans>
      </InputLabel>
      <ImageDragZone onDrop={onDrop} onClick={selectRadarImageFile}>
        {value ? <img src={value} /> : <DragIcon width={100} />}
      </ImageDragZone>
    </div>
  );
}
