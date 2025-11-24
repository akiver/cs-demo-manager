import React from 'react';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useCameraForm } from './use-camera-form';

type Props = {
  id: string;
  name: 'x' | 'y' | 'z' | 'pitch' | 'yaw';
  value: string;
  onChange: (value: string) => void;
};

export function CameraCoordinatesInputNumber({ id, name, value, onChange }: Props) {
  const { tryUpdatingCoordinatesFromGameCommand } = useCameraForm();

  return (
    <InputNumber
      id={id}
      name={name}
      placeholder="0"
      allowNegativeNumber={true}
      value={value}
      onPaste={(event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text');
        tryUpdatingCoordinatesFromGameCommand(pasteData);
      }}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
}
