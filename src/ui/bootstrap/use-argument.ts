import { useContext } from 'react';
import type { ArgumentName } from 'csdm/common/argument/argument-name';
import { ArgumentsContext } from './arguments-provider';

export function useArgument(argumentName: ArgumentName) {
  const context = useContext(ArgumentsContext);

  return context.arguments.find((arg) => arg.name === argumentName)?.value;
}
