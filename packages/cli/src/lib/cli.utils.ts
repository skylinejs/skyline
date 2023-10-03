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
  const cliName = config.cliName
    ? chalk.hex(config.cliNameColor).bgHex(config.cliNameBackgroundColor)(
        config.cliName
      )
    : '';

  return `[${cliName}] ${config.commandPromptMessage}`;
}
