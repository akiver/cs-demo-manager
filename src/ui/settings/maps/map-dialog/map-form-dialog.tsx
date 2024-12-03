import React from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { ThumbnailInput } from 'csdm/ui/settings/maps/map-dialog/thumbnail-input';
import { RadarInput } from 'csdm/ui/settings/maps/map-dialog/radar-input';
import { CoordinateXInput } from 'csdm/ui/settings/maps/map-dialog/coordinate-x-input';
import { CoordinateYInput } from 'csdm/ui/settings/maps/map-dialog/coordinate-y-input';
import { ScaleInput } from 'csdm/ui/settings/maps/map-dialog/scale-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { LowerRadarInput } from 'csdm/ui/settings/maps/map-dialog/lower-radar-input';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { SaveButton } from 'csdm/ui/components/buttons/save-button';
import type { MapPayload } from 'csdm/server/handlers/renderer-process/map/map-payload';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useMapForm } from 'csdm/ui/settings/maps/map-dialog/use-map-form';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { ThresholdZInput } from './threshold-z-input';

function InputsRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-x-12">{children}</div>;
}

type Props = {
  nameInput: ReactNode;
  error: string | undefined;
  onSubmit: (payload: MapPayload) => Promise<void>;
};

export function MapFormDialog({ nameInput, error, onSubmit }: Props) {
  const { fields, validate, id, game } = useMapForm();
  const { hideDialog } = useDialog();

  const validateAndSubmit = () => {
    const isValid = validate();
    if (isValid) {
      const payload: MapPayload = {
        id,
        name: fields.name.value,
        game,
        posX: Number(fields.posX.value),
        posY: Number(fields.posY.value),
        thresholdZ: Number(fields.thresholdZ.value),
        scale: Number(fields.scale.value),
        radarBase64: fields.radarBase64.value,
        lowerRadarBase64: fields.lowerRadarBase64.value,
        thumbnailBase64: fields.thumbnailBase64.value,
      };

      onSubmit(payload);
    }
  };

  return (
    <Dialog
      onEnterPressed={(event) => {
        event.preventDefault();
        validateAndSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Map</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8">
          {nameInput}
          <InputsRow>
            <CoordinateXInput />
            <CoordinateYInput />
            <ThresholdZInput />
            <ScaleInput />
          </InputsRow>
          <InputsRow>
            <ThumbnailInput />
            <RadarInput />
            <LowerRadarInput />
          </InputsRow>
          <FieldError
            error={error || fields.thumbnailBase64.error || fields.radarBase64.error || fields.lowerRadarBase64.error}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <div className="mr-auto">
          <ExternalLink href="https://cs-demo-manager.com/docs/guides/maps#addingediting-a-map">
            <Trans>Documentation</Trans>
          </ExternalLink>
        </div>
        <SaveButton onClick={validateAndSubmit} />
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
