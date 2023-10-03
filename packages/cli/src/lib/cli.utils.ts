import type { SkylineCliCommand } from './command/cli-command';
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
): string {
  // Check if display name was provided
  if (command.displayName) return command.displayName;

  // Derive display name from class name
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

export function getCommandIds(
  command: typeof SkylineCliCommand,
  config: Pick<CliConfiguration, 'commandIdSeparator'>
): string[] {
  // Check if command ID was provided
  if (command.commandId) {
    return Array.isArray(command.commandId)
      ? command.commandId
      : [command.commandId];
  }

  // Derive command ID from class name
  let commandId = command.name;

  // Split on uppercase letters, lowercase and trim
  commandId = commandId
    .replace(/([A-Z])/g, config.commandIdSeparator + '$1')
    .toLowerCase()
    .trim();

  // Remove "Command" suffix
  if (commandId.endsWith('command')) {
    commandId = commandId.slice(0, -'command'.length);
  }

  // Remove leading separators
  while (commandId.startsWith(config.commandIdSeparator)) {
    commandId = commandId.slice(config.commandIdSeparator.length);
  }

  // Remove trailing separators
  while (commandId.endsWith(config.commandIdSeparator)) {
    commandId = commandId.slice(0, -config.commandIdSeparator.length);
  }

  return [commandId];
}
