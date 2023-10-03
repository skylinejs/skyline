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
    const { cliNameColor: color, cliNameBackgroundColor: bgColor } = config;
    cliName = chalk.hex(color).bgHex(bgColor)(`[${config.cliName}]`) + ' ';
  }

  return `${cliName}${config.commandPromptMessage}`;
}

export function getCommandDisplayName(command: typeof SkylineCliCommand) {
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

  return name;
}
