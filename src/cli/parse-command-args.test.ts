import { describe, it, expect } from 'vite-plus/test';
import { parseCommandArgs, type CommandOptions } from './parse-command-args';
import { InvalidArgument } from './errors/invalid-argument';

const options = {
  output: { type: 'string', short: 'o', description: 'Output folder.' },
  source: { type: 'string', choices: ['valve', 'esl'], description: 'Demo source.' },
  force: { type: 'boolean', description: 'Force.' },
  'show-x-ray': { type: 'boolean', negatable: true, description: 'Show the X-Ray.' },
} satisfies CommandOptions;

function getErrorMessage(args: string[], allowPositionals = true) {
  try {
    parseCommandArgs(args, options, allowPositionals);
  } catch (error) {
    expect(error).toBeInstanceOf(InvalidArgument);
    return (error as InvalidArgument).message;
  }

  throw new Error('Expected the args to be invalid');
}

describe('parseCommandArgs', () => {
  it('should parse options and positionals in any order', () => {
    const { values, positionals } = parseCommandArgs(
      ['a.dem', '--force', 'b.dem', '-o', 'out', '--source=esl', 'c.dem'],
      options,
      true,
    );

    expect(values).toEqual({ force: true, output: 'out', source: 'esl' });
    expect(positionals).toEqual(['a.dem', 'b.dem', 'c.dem']);
  });

  it('should set negatable options to false with the --no- prefix', () => {
    const { values } = parseCommandArgs(['--no-show-x-ray'], options, false);

    expect(values['show-x-ray']).toBe(false);
  });

  it('should reject the --no- prefix on non-negatable options', () => {
    expect(getErrorMessage(['--no-force'])).toBe('Unknown option: --no-force');
  });

  it('should reject unknown options and suggest the closest one', () => {
    expect(getErrorMessage(['--outptu', 'out'])).toBe('Unknown option: --outptu\nDid you mean --output?');
    expect(getErrorMessage(['--unknown'])).toBe('Unknown option: --unknown');
    expect(getErrorMessage(['-x'])).toBe('Unknown option: -x');
  });

  it('should reject string options without value', () => {
    expect(getErrorMessage(['--output'])).toBe('Missing value for --output');
    expect(getErrorMessage(['--output', '--force'])).toBe('Missing value for --output');
    expect(getErrorMessage(['-o'])).toBe('Missing value for -o');
  });

  it('should accept values starting with a dash when provided inline', () => {
    const { values } = parseCommandArgs(['--output=-folder'], options, false);

    expect(values.output).toBe('-folder');
  });

  it('should reject values not in the choices', () => {
    expect(getErrorMessage(['--source', 'faceit'])).toBe(
      'Invalid value "faceit" for --source, allowed values: valve, esl',
    );
  });

  it('should reject boolean options with a value', () => {
    expect(getErrorMessage(['--force=true'])).toBe('The --force option does not take a value');
  });

  it('should reject positionals when not allowed', () => {
    expect(getErrorMessage(['a.dem'], false)).toBe('Unexpected argument: a.dem');
  });
});
