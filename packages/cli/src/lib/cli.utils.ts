import { SkylineCliCommand } from './cli-command';
import { CliConfiguration } from './cli-configuration.interface';
import chalk from 'chalk';

export function getCommandPromptMessage(
  config: Pick<
    CliConfiguration,
    | 'cliName'
    | 'cliNameColor'
    | 'cliNameBackgroundColor'
    | 'commandPromptMessage'
  >
) {
  let cliName = '';
  if (config.cliName) {
    cliName = `[${config.cliName}]`;

    const { cliNameColor: color, cliNameBackgroundColor } = config;
    const bgColor = 'bg' + capitalize(cliNameBackgroundColor);
    cliName = (chalk as any)[bgColor](cliName);
    cliName = chalk[color](cliName);
    cliName += ' ';
  }

  return `${cliName}${config.commandPromptMessage}`;
}

export function getCommandDisplayName(
  command: typeof SkylineCliCommand,
  config: Pick<CliConfiguration, 'commandDisplayNameCapitalize'>
) {
  if (command.displayName) return command.displayName;

  let name = command.name;

  // Remove "Command" suffix
  if (name.endsWith('Command')) {
    name = name.slice(0, -'Command'.length);
  }

  // Split on uppercase letters, lowercase and trim
  name = name
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();

  // Capitalize first letter
  if (config.commandDisplayNameCapitalize) {
    name = capitalize(name);
  }
  return name;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
