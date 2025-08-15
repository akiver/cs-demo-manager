import React, { useState, createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ArgumentName } from 'csdm/common/argument/argument-name';
import { Status } from 'csdm/common/types/status';
import { Loading } from './loading';

type Argument = {
  name: ArgumentName;
  value: string;
};

export const ArgumentsContext = createContext<{
  arguments: Argument[];
  clearArguments: () => void;
}>({
  arguments: [],
  clearArguments: () => {
    throw new Error('clearArguments not implemented');
  },
});

type Props = {
  children: ReactNode;
};

export function ArgumentsProvider({ children }: Props) {
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [args, setArgs] = useState<Argument[]>([]);

  useEffect(() => {
    const getStartupArguments = async () => {
      const args = await window.csdm.getStartupArguments();
      setArgs(args);
      setStatus(Status.Success);
    };

    getStartupArguments();
  }, []);

  const clearArguments = () => {
    window.csdm.clearStartupArguments();
    setArgs([]);
  };

  if (status === Status.Loading) {
    return <Loading />;
  }

  return (
    <ArgumentsContext.Provider
      value={{
        arguments: args,
        clearArguments,
      }}
    >
      {children}
    </ArgumentsContext.Provider>
  );
}
