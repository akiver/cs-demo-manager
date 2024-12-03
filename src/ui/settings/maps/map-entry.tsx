import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Map } from 'csdm/common/types/map';
import { Button } from 'csdm/ui/components/buttons/button';
import { DeleteMapDialog } from './delete-map-dialog';
import { EditMapDialog } from './edit-map-dialog';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { MapFormProvider, type MapFormValues } from 'csdm/ui/settings/maps/map-dialog/map-form-provider';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';

type Props = {
  map: Map;
};

export function MapEntry({ map }: Props) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const { showDialog } = useDialog();

  return (
    <div className="w-[256px] border border-gray-300 rounded">
      <img src={getMapThumbnailSrc(map.name, map.game)} alt={map.name} />
      <div className="p-8">
        <p>{map.name}</p>
        <div className="flex gap-8 mt-8">
          <Button
            onClick={async () => {
              const [radarBase64, lowerRadarBase64, thumbnailBase64] = await Promise.all([
                window.csdm.getMapRadarBase64(map.name, map.game),
                window.csdm.getMapLowerRadarBase64(map.name, map.game),
                window.csdm.getMapThumbnailBase64(map.name, map.game),
              ]);
              const initialValues: MapFormValues = {
                name: map.name,
                posX: String(map.posX),
                posY: String(map.posY),
                thresholdZ: String(map.thresholdZ),
                scale: String(map.scale),
                radarBase64,
                lowerRadarBase64,
                thumbnailBase64,
              };
              showDialog(
                <MapFormProvider id={map.id} game={map.game} initialValues={initialValues}>
                  <EditMapDialog />
                </MapFormProvider>,
              );
            }}
          >
            <Trans context="Button">Edit</Trans>
          </Button>
          <DeleteButton
            onClick={() => {
              showDialog(<DeleteMapDialog map={map} />);
            }}
          />
        </div>
      </div>
    </div>
  );
}
