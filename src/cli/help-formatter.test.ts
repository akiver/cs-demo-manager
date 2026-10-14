import { describe, it, expect, afterEach } from 'vite-plus/test';
import { HelpFormatter } from './help-formatter';

const originalColumns = process.stdout.columns;

function setTerminalWidth(width: number) {
  process.stdout.columns = width;
}

afterEach(() => {
  process.stdout.columns = originalColumns;
});

describe('HelpFormatter.formatCommandHelp', () => {
  it('should format the command help', () => {
    setTerminalWidth(80);
    const help = new HelpFormatter().formatCommandHelp({
      name: 'analyze',
      description: 'Analyze demos.',
      usages: ['<demo-paths...> [options]'],
      notes: ['Demos already analyzed are skipped.'],
      arguments: [{ label: '<demo-paths...>', description: '.dem files or folders.' }],
      options: {
        source: {
          type: 'string',
          valueName: 'source',
          choices: ['valve', 'esl'],
          defaultValue: 'valve',
          description: 'Demo source.',
        },
        output: { type: 'string', short: 'o', description: 'Output folder.' },
        'show-x-ray': { type: 'boolean', negatable: true, description: 'Show the X-Ray.' },
        'ffmpeg-crf': { type: 'string', valueName: 'number', description: 'CRF.', group: 'FFmpeg options' },
      },
      examples: [{ description: 'Analyze 1 demo', args: 'demo.dem' }],
    });

    expect(help).toBe(
      [
        'Analyze demos.',
        '',
        'Usage:',
        '  csdm analyze <demo-paths...> [options]',
        '',
        'Demos already analyzed are skipped.',
        '',
        'Arguments:',
        '  <demo-paths...>            .dem files or folders.',
        '',
        'Options:',
        '      --source <source>      Demo source.',
        '                             Allowed values: valve, esl',
        '                             Default: valve',
        '  -o, --output <value>       Output folder.',
        '      --[no-]show-x-ray      Show the X-Ray.',
        '  -h, --help                 Show this help.',
        '',
        'FFmpeg options:',
        '      --ffmpeg-crf <number>  CRF.',
        '',
        'Examples:',
        '  Analyze 1 demo:',
        '    csdm analyze demo.dem',
      ].join('\n'),
    );
  });
});

describe('HelpFormatter.formatRowsSection', () => {
  it('should wrap long descriptions', () => {
    setTerminalWidth(40);
    const section = new HelpFormatter().formatRowsSection('Commands', [
      { label: 'json', description: 'Export demos into JSON files.' },
      { label: 'video', description: 'Generate videos from demos and control the video generation queue.' },
    ]);

    expect(section).toBe(
      [
        'Commands:',
        '  json   Export demos into JSON files.',
        '  video  Generate videos from demos and',
        '         control the video generation',
        '         queue.',
      ].join('\n'),
    );
  });

  it('should start the description on the next line when the label is too long', () => {
    const label = `--${'a'.repeat(45)}`;
    setTerminalWidth(100);
    const section = new HelpFormatter().formatRowsSection('Options', [
      { label, description: 'Long option.' },
      { label: '--short', description: 'Short option.' },
    ]);

    expect(section).toBe(
      ['Options:', `  ${label}`, `${' '.repeat(44)}Long option.`, `  --short${' '.repeat(35)}Short option.`].join('\n'),
    );
  });
});
