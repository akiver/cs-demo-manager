export function getArgumentValueFromArray(values: string[], argumentName: string) {
  const argument = values.find((value) => value.startsWith(`--${argumentName}=`));
  if (argument === undefined) {
    return undefined;
  }
  const value = argument.slice(argument.indexOf('=') + 1);
  return value;
}
