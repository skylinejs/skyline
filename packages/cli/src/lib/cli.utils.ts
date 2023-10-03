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

export function getCommandName(command: typeof SkylineCliCommand) {
  if (command.commandName) return command.commandName;

  let name = command.name;

  // Remove "Command" suffix
  if (name.endsWith('Command')) {
    name = name.slice(0, -'Command'.length);
  }

  // Split on uppercase letters
  name = name.replace(/([A-Z])/g, ' $1');

  // Lowercase
  name = name.toLowerCase();

  return name;
}
