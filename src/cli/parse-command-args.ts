import { parseArgs } from 'node:util';
import { InvalidArgument } from './errors/invalid-argument';
import { findSimilarName } from './find-similar-name';

export type CommandOption = {
  type: 'string' | 'boolean';
  short?: string;
  description: string;
  // Placeholder of the value in the help, e.g. "path" for "--output <path>".
  valueName?: string;
  // Allowed values of a string option.
  choices?: readonly string[];
  // Default value displayed in the help only, commands apply their defaults themselves.
  defaultValue?: string;
  // Boolean option that can be disabled with --no-<name>, used to override a value coming from the app settings.
  negatable?: boolean;
  // Title of the help section where the option is listed, "Options" by default.
  group?: string;
};

export type CommandOptions = Record<string, CommandOption>;

function buildUnknownOptionMessage(rawName: string, options: CommandOptions) {
  const message = `Unknown option: ${rawName}`;
  if (!rawName.startsWith('--')) {
    return message;
  }

  const similarName = findSimilarName(rawName.slice(2), Object.keys(options));
  if (similarName === undefined) {
    return message;
  }

  return `${message}\nDid you mean --${similarName}?`;
}

/**
 * Node's strict mode reports invalid arguments with messages that are not user-friendly, a non-strict parse returns
 * the tokens which are validated here to report clear errors.
 */
function assertArgsAreValid(args: string[], options: CommandOptions, allowPositionals: boolean) {
  const { tokens } = parseArgs({
    args,
    options,
    allowPositionals: true,
    allowNegative: true,
    strict: false,
    tokens: true,
  });

  for (const token of tokens) {
    if (token.kind === 'positional') {
      if (!allowPositionals) {
        throw new InvalidArgument(`Unexpected argument: ${token.value}`);
      }
      continue;
    }

    if (token.kind !== 'option') {
      continue;
    }

    const option = Object.hasOwn(options, token.name) ? options[token.name] : undefined;
    const isNegated = token.rawName === `--no-${token.name}`;
    if (option === undefined || (isNegated && !option.negatable)) {
      throw new InvalidArgument(buildUnknownOptionMessage(token.rawName, options));
    }

    if (option.type === 'boolean') {
      if (token.value !== undefined) {
        throw new InvalidArgument(`The ${token.rawName} option does not take a value`);
      }
      continue;
    }

    // A value starting with a dash is likely the next option, the value has been forgotten.
    if (token.value === undefined || (!token.inlineValue && token.value.startsWith('-'))) {
      throw new InvalidArgument(`Missing value for ${token.rawName}`);
    }

    if (option.choices !== undefined && !option.choices.includes(token.value)) {
      throw new InvalidArgument(
        `Invalid value "${token.value}" for ${token.rawName}, allowed values: ${option.choices.join(', ')}`,
      );
    }
  }
}

export function parseCommandArgs<Options extends CommandOptions>(
  args: string[],
  options: Options,
  allowPositionals: boolean,
) {
  assertArgsAreValid(args, options, allowPositionals);

  return parseArgs({
    args,
    options,
    allowPositionals: true,
    allowNegative: true,
    strict: true,
  });
}
