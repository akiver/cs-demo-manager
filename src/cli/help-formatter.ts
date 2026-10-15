import { isWindows } from 'csdm/node/os/is-windows';
import type { CommandOption, CommandOptions } from './parse-command-args';

type Row = {
  label: string;
  description: string;
};

export type CommandHelp = {
  name: string;
  description: string;
  // Usages without the "csdm <name>" prefix.
  usages: string[];
  notes?: string[];
  arguments?: Row[];
  subCommands?: Row[];
  options: CommandOptions;
  // Examples args without the "csdm <name>" prefix.
  examples?: { description: string; args: string }[];
};

export class HelpFormatter {
  private readonly indent = '  ';
  private readonly columnGap = 2;
  private readonly maxLabelWidth = 40;
  private readonly minDescriptionWidth = 30;
  private readonly helpOption: CommandOption = {
    type: 'boolean',
    short: 'h',
    description: 'Show this help.',
  };

  public formatCommandHelp(help: CommandHelp) {
    const options: CommandOptions = { ...help.options, help: this.helpOption };
    const optionRowsPerGroup = new Map<string, Row[]>();
    for (const [name, option] of Object.entries(options)) {
      const group = option.group ?? 'Options';
      const rows = optionRowsPerGroup.get(group) ?? [];
      rows.push({ label: this.formatOptionLabel(name, option), description: this.formatOptionDescription(option) });
      optionRowsPerGroup.set(group, rows);
    }

    const argumentRows = help.arguments ?? [];
    const subCommandRows = help.subCommands ?? [];
    const labelWidth = this.getLabelWidth([
      ...argumentRows,
      ...subCommandRows,
      ...[...optionRowsPerGroup.values()].flat(),
    ]);

    const sections = [
      help.description,
      this.formatSection(
        'Usage',
        help.usages.map((usage) => `${this.indent}csdm ${help.name} ${usage}`.trimEnd()),
      ),
    ];
    for (const note of help.notes ?? []) {
      sections.push(this.wrapText(note, this.getTerminalWidth()).join('\n'));
    }
    if (argumentRows.length > 0) {
      sections.push(this.formatSection('Arguments', this.formatRows(argumentRows, labelWidth)));
    }
    if (subCommandRows.length > 0) {
      sections.push(this.formatSection('Commands', this.formatRows(subCommandRows, labelWidth)));
    }
    for (const [group, rows] of optionRowsPerGroup) {
      sections.push(this.formatSection(group, this.formatRows(rows, labelWidth)));
    }
    if (help.examples !== undefined && help.examples.length > 0) {
      const lines = help.examples.flatMap(({ description, args }) => {
        return [`${this.indent}${description}:`, `${this.indent}${this.indent}csdm ${help.name} ${args}`.trimEnd()];
      });
      sections.push(this.formatSection('Examples', lines));
    }

    return sections.join('\n\n');
  }

  public formatOptionsSection(title: string, options: CommandOptions) {
    const rows = Object.entries(options).map(([name, option]) => {
      return { label: this.formatOptionLabel(name, option), description: this.formatOptionDescription(option) };
    });

    return this.formatRowsSection(title, rows);
  }

  public formatRowsSection(title: string, rows: Row[]) {
    return this.formatSection(title, this.formatRows(rows, this.getLabelWidth(rows)));
  }

  public formatExamplePath(...segments: string[]) {
    if (isWindows) {
      return `"C:\\Users\\username\\${segments.join('\\')}"`;
    }

    return `~/${segments.join('/')}`;
  }

  private getTerminalWidth() {
    return Math.min(process.stdout.columns || 80, 100);
  }

  private wrapText(text: string, width: number) {
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        if (line === '') {
          line = word;
        } else if (line.length + 1 + word.length <= width) {
          line += ` ${word}`;
        } else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);
    }

    return lines;
  }

  private getLabelWidth(rows: Row[]) {
    const longestLabelLength = Math.max(...rows.map((row) => row.label.length));

    return Math.min(longestLabelLength, this.maxLabelWidth);
  }

  private formatRows(rows: Row[], labelWidth: number) {
    const descriptionColumn = this.indent.length + labelWidth + this.columnGap;
    const descriptionWidth = Math.max(this.getTerminalWidth() - descriptionColumn, this.minDescriptionWidth);
    const descriptionIndent = ' '.repeat(descriptionColumn);
    const lines: string[] = [];
    for (const { label, description } of rows) {
      const descriptionLines = this.wrapText(description, descriptionWidth);
      // Labels too long to be aligned have their description starting on the next line.
      if (label.length > labelWidth) {
        lines.push(`${this.indent}${label}`);
      } else {
        const firstLine = descriptionLines.shift() ?? '';
        lines.push(`${this.indent}${label.padEnd(labelWidth + this.columnGap)}${firstLine}`.trimEnd());
      }
      for (const line of descriptionLines) {
        lines.push(`${descriptionIndent}${line}`);
      }
    }

    return lines;
  }

  private formatSection(title: string, lines: string[]) {
    return [`${title}:`, ...lines].join('\n');
  }

  private formatOptionLabel(name: string, option: CommandOption) {
    const short = option.short ? `-${option.short}, ` : '    ';
    const longName = option.negatable ? `--[no-]${name}` : `--${name}`;
    const value = option.type === 'string' ? ` <${option.valueName ?? 'value'}>` : '';

    return `${short}${longName}${value}`;
  }

  private formatOptionDescription(option: CommandOption) {
    let description = option.description;
    if (option.choices) {
      description += `\nAllowed values: ${option.choices.join(', ')}`;
    }
    if (option.defaultValue !== undefined) {
      description += `\nDefault: ${option.defaultValue}`;
    }

    return description;
  }
}
