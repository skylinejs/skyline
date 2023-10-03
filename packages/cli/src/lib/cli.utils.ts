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
