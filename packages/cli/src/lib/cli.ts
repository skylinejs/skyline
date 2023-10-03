import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';
import { getCommandName, getCommandPromptMessage } from './cli.utils';
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { SkylineCliCommand } from './cli-command';
import { fuzzyFilter } from './levenshtein-distance';

export class SkylineCli {
  private readonly config: CliConfiguration;
  private readonly timeout?: CliInactivityTimeout;

  private exit = false;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {
      cliName: config.cliName ?? 'skyline',
      cliNameColor: config.cliNameColor ?? '#000000',
      cliNameBackgroundColor: config.cliNameBackgroundColor ?? '#FFFFFF',

      commands: config.commands ?? [],
      commandPromptMessage: config.commandPromptMessage ?? 'Execute a command',
    };

    // Inquirer
    inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt);

    // Inactivity timeout
    if (config.inactivityTimeout instanceof CliInactivityTimeout) {
      this.timeout = config.inactivityTimeout;
    } else if (typeof config.inactivityTimeout === 'number') {
      this.timeout = new CliInactivityTimeout({
        stdinTimeout: config.inactivityTimeout,
        stdoutTimeout: config.inactivityTimeout,
        stderrTimeout: config.inactivityTimeout,
      });
    }
    this.timeout?.register();

    // SIGINT handler
    process.on('SIGINT', () => {
      this.exit = true;
      process.exit(0);
    });
  }

  registerCommand(command: typeof SkylineCliCommand) {
    this.config.commands.push(command);
  }

  async run() {
    while (!this.exit) {
      // Prompt for command
      const { command } = await inquirer.prompt<{ command: string }>([
        {
          type: 'autocomplete',
          name: 'command',
          message: getCommandPromptMessage(this.config),
          source: (_: any, search: string) => {
            search = (search || '').trim();
            const commandNames = this.config.commands.map((command) =>
              getCommandName(command)
            );

            if (!search) return commandNames;

            // Filter via levenshtein distance
            const filteredCommandNames = fuzzyFilter(search, commandNames, {
              extract: (cmd: string) => cmd,
            }).map((result: any) => result.original);

            return filteredCommandNames;
          },
        },
      ]);
    }
  }
}
