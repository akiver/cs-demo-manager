import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Game } from 'csdm/common/types/counter-strike';
import { extractCoordinatesFromCommand } from './extract-coordinates-from-setpos-command';

export type CameraFormValues = {
  name: string;
  x: string;
  y: string;
  z: string;
  pitch: string;
  yaw: string;
  comment: string;
  color: string;
  previewBase64: string | null;
};

type Field = {
  value: string;
  error: string | undefined;
  validate: (value: string) => string | undefined;
};

export type FieldName = keyof CameraFormValues;
type MapField = Record<FieldName, Field>;

export const CameraFormContext = createContext<{
  id?: string;
  game: Game;
  mapName: string;
  fields: Record<FieldName, Field>;
  validate: () => boolean;
  setField: (field: FieldName, value: string, error?: string | undefined) => void;
  validateField: (field: FieldName) => void;
  tryUpdatingCoordinatesFromGameCommand: (command: string) => void;
}>({
  game: Game.CS2,
  mapName: '',
  fields: {} as MapField,
  validate: () => {
    throw new Error('validate not implemented');
  },
  setField: () => {
    throw new Error('setField not implemented');
  },
  validateField: () => {
    throw new Error('validateField not implemented');
  },
  tryUpdatingCoordinatesFromGameCommand: () => {
    throw new Error('tryUpdatingCoordinatesFromGameCommand not implemented');
  },
});

type Props = {
  children: ReactNode;
  id?: string;
  game: Game;
  mapName: string;
  initialValues?: CameraFormValues;
};

export function CameraFormProvider({ children, id, game, mapName, initialValues }: Props) {
  const { t } = useLingui();
  const [fields, setFields] = useState<MapField>({
    name: {
      value: initialValues?.name ?? '',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Name is required.`;
        }
      },
    },
    color: {
      value: initialValues?.color ?? '#2fdecf',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Color is required.`;
        }
      },
    },
    x: {
      value: initialValues?.x ?? '0',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Coordinate X is required.`;
        }
      },
    },
    y: {
      value: initialValues?.y ?? '0',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Coordinate Y is required.`;
        }
      },
    },
    z: {
      value: initialValues?.z ?? '0',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Coordinate Z is required.`;
        }
      },
    },
    pitch: {
      value: initialValues?.pitch ?? '0',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Pitch is required.`;
        }
      },
    },
    yaw: {
      value: initialValues?.yaw ?? '0',
      error: undefined,
      validate: (value: string) => {
        if (value === '') {
          return t`Yaw is required.`;
        }
      },
    },
    previewBase64: {
      value: initialValues?.previewBase64 ?? '',
      error: undefined,
      validate: () => {
        return undefined;
      },
    },
    comment: {
      value: initialValues?.comment ?? '',
      error: undefined,
      validate: () => {
        return undefined;
      },
    },
  });

  const setField = (name: FieldName, value: string, error?: string | undefined) => {
    setFields((prev) => {
      return { ...prev, [name]: { ...prev[name], value, error } };
    });
  };

  const validateField = (field: keyof CameraFormValues) => {
    const error = fields[field].validate(fields[field].value);
    setFields((prev) => {
      return { ...prev, [field]: { ...prev[field], error } };
    });

    return error;
  };

  const validate = () => {
    let isValid = true;
    for (const field of Object.keys(fields)) {
      const error = validateField(field as FieldName);
      if (error) {
        isValid = false;
      }
    }

    return isValid;
  };

  const tryUpdatingCoordinatesFromGameCommand = (command: string) => {
    try {
      const { x, y, z, pitch, yaw } = extractCoordinatesFromCommand(command);
      setField('x', x.toString());
      setField('y', y.toString());
      setField('z', z.toString());
      setField('pitch', pitch.toString());
      setField('yaw', yaw.toString());
    } catch {
      // noop
    }
  };

  return (
    <CameraFormContext.Provider
      value={{
        id,
        game,
        mapName,
        fields,
        validate,
        setField,
        validateField,
        tryUpdatingCoordinatesFromGameCommand,
      }}
    >
      {children}
    </CameraFormContext.Provider>
  );
}
