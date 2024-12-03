import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useWebSocketClient } from '../../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from '../../components/toasts/use-show-toast';
import { SearchInput } from '../../components/inputs/search-input';
import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';

type Props = {
  isDisabled: boolean;
  selectedMaps: string[];
  onMapSelected: (map: string) => void;
  onMapRemoved: (map: string) => void;
};

export function SearchMapsInput({ isDisabled, selectedMaps, onMapSelected, onMapRemoved }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const { t } = useLingui();

  return (
    <SearchInput<string>
      isDisabled={isDisabled}
      placeholder={t({
        context: 'Input placeholder',
        message: `Map's name`,
      })}
      noResultMessage={t`No maps found`}
      getValueId={(mapName) => mapName}
      onValueRemoved={onMapRemoved}
      onValueSelected={onMapSelected}
      renderResult={(mapName) => <span>{mapName}</span>}
      renderValue={(mapName) => <span>{mapName}</span>}
      selectedValues={selectedMaps}
      search={async (value, ignoredMapNames) => {
        try {
          const payload: MapNamesFilter = {
            name: value,
            ignoredNames: ignoredMapNames,
          };
          const mapNames = await client.send({
            name: RendererClientMessageName.SearchMaps,
            payload,
          });

          return mapNames;
        } catch (error) {
          showToast({
            type: 'error',
            content: <Trans>An error occurred</Trans>,
          });
          return [];
        }
      }}
    />
  );
}
