import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Game } from 'csdm/common/types/counter-strike';

export type MapFormValues = {
  name: string;
  posX: string;
  posY: string;
  thresholdZ: string;
  scale: string;
  thumbnailBase64: string | undefined;
  radarBase64: string | undefined;
  lowerRadarBase64: string | undefined;
};

type Field = {
  value: string;
  error: string | undefined;
  validate(): string | undefined;
};

export type FieldName = keyof MapFormValues;
type MapField = Record<FieldName, Field>;

export const MapFormContext = createContext<{
  id?: string;
  game: Game;
  fields: Record<FieldName, Field>;
  validate: () => boolean;
  setField: (field: FieldName, value: string, error: string | undefined) => void;
  validateField: (field: FieldName) => void;
}>({
  game: Game.CS2,
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
});

type Props = {
  children: ReactNode;
  id?: string;
  game: Game;
  initialValues?: MapFormValues;
};

export function MapFormProvider({ children, id, game, initialValues }: Props) {
  const { t } = useLingui();
  const [fields, setFields] = useState<MapField>({
    name: {
      value: initialValues?.name ?? '',
      error: undefined,
      validate(this: Field) {
        if (this.value === '') {
          return t`Name is required.`;
        }
      },
    },
    posX: {
      value: initialValues?.posX ?? '0',
      error: undefined,
      validate() {
        if (this.value === '') {
          return t`Coordinate X is required.`;
        }
      },
    },
    posY: {
      value: initialValues?.posY ?? '0',
      error: undefined,
      validate() {
        if (this.value === '') {
          return t`Coordinate Y is required.`;
        }
      },
    },
    thresholdZ: {
      value: initialValues?.thresholdZ ?? '0',
      error: undefined,
      validate() {
        if (this.value === '') {
          return t`Threshold Z is required.`;
        }
      },
    },
    scale: {
      value: initialValues?.scale ?? '0',
      error: undefined,
      validate() {
        if (this.value === '') {
          return t`Scale is required.`;
        }
      },
    },
    radarBase64: {
      value: initialValues?.radarBase64 ?? '',
      error: undefined,
      validate() {
        return undefined;
      },
    },
    lowerRadarBase64: {
      value: initialValues?.lowerRadarBase64 ?? '',
      error: undefined,
      validate() {
        return undefined;
      },
    },
    thumbnailBase64: {
      value: initialValues?.thumbnailBase64 ?? '',
      error: undefined,
      validate() {
        return undefined;
      },
    },
  });

  const setField = (name: FieldName, value: string, error?: string | undefined) => {
    setFields({
      ...fields,
      [name]: {
        ...fields[name],
        ...{ value, error },
      },
    });
  };

  const validateField = (field: keyof MapFormValues) => {
    const error = fields[field].validate();
    setFields({ ...fields, [field]: { ...fields[field], error } });
  };

  const validate = () => {
    for (const field of Object.values(fields)) {
      const hasError = field.validate() !== undefined;
      if (hasError) {
        return false;
      }
    }

    return true;
  };

  return (
    <MapFormContext.Provider
      value={{
        id,
        game,
        fields,
        validate,
        setField,
        validateField,
      }}
    >
      {children}
    </MapFormContext.Provider>
  );
}
