import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { ImageDragZone } from './image-drop-zone';
import { DragIcon } from 'csdm/ui/icons/drag-icon';
import { useMapFormField } from './use-map-form-field';

export function ThumbnailInput() {
  const { value, setField } = useMapFormField('thumbnailBase64');
  const { t } = useLingui();

  const updateFieldFromImageFilePath = async (imageFilePath: string) => {
    try {
      const maxFileWidth = 600;
      const maxFileHeight = 340;
      const png = await window.csdm.getPngInformation(imageFilePath);
      if (png.width > maxFileWidth || png.height > maxFileHeight) {
        setField(value, t`Thumbnail image pixels must be smaller than ${maxFileWidth}x${maxFileHeight}`);
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
      updateFieldFromImageFilePath(window.csdm.getWebFilePath(files[0]));
    }
  };

  const selectThumbnailFile = async () => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ extensions: ['png'], name: t`PNG Files` }],
    };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }

    const [imagePath] = filePaths;
    updateFieldFromImageFilePath(imagePath);
  };

  return (
    <div className="flex flex-col">
      <InputLabel>
        <Trans context="Input label">Thumbnail</Trans>
      </InputLabel>
      <ImageDragZone onDrop={onDrop} onClick={selectThumbnailFile}>
        {value ? <img src={value} /> : <DragIcon width={100} />}
      </ImageDragZone>
    </div>
  );
}
