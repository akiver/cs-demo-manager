import { useContext } from 'react';
import { MapFormContext } from 'csdm/ui/settings/maps/map-dialog/map-form-provider';

export function useMapForm() {
  const form = useContext(MapFormContext);

  return form;
}
