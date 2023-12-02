import React from 'react';
import { Trans, msg } from '@lingui/macro';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { ImageDragZone } from './image-drop-zone';
import { DragIcon } from 'csdm/ui/icons/drag-icon';
import { useMapFormField } from './use-map-form-field';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function ThumbnailInput() {
  const { value, setField } = useMapFormField('thumbnailBase64');
  const _ = useI18n();

  const updateFieldFromImageFilePath = async (imageFilePath: string) => {
    try {
      const maxFileWidth = 600;
      const maxFileHeight = 340;
      const png = await window.csdm.getPngInformation(imageFilePath);
      if (png.width > maxFileWidth || png.height > maxFileHeight) {
        setField(value, _(msg`Thumbnail image pixels must be smaller than ${maxFileWidth}x${maxFileHeight}`));
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
      updateFieldFromImageFilePath(files[0].path);
    }
  };

  const selectThumbnailFile = async () => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ extensions: ['png'], name: 'PNG Files' }],
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
