import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';
import { getCommandDisplayName, getCommandPromptMessage } from './cli.utils';
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { SkylineCliCommand } from './cli-command';
import { fuzzyFilter } from './levenshtein-distance';

export class SkylineCli {
  private readonly config: CliConfiguration;
  private readonly timeout?: CliInactivityTimeout;

  private exit = false;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {
      // === CLI name ===
      cliName: config.cliName ?? 'skyline',
      cliNameColor: config.cliNameColor ?? '#000000',
      cliNameBackgroundColor: config.cliNameBackgroundColor ?? '#FFFFFF',

      // === Command prompt ===
      commandPromptMessage: config.commandPromptMessage ?? 'Execute a command',
      commandPromptPageSize: config.commandPromptPageSize ?? 10,

      configurationFilePath: config.configurationFilePath ?? '.skylinerc.json',

      commands: config.commands ?? [],
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
      const { command } = await inquirer.prompt<{
        command: typeof SkylineCliCommand;
      }>([
        {
          type: 'autocomplete',
          name: 'command',
          pageSize: this.config.commandPromptPageSize,
          message: getCommandPromptMessage(this.config),
          source: (_: any, search: string) => {
            search = (search || '').trim();
            const commands = this.config.commands.map((command) => ({
              name: getCommandDisplayName(command),
              value: command,
            }));

            if (!search) return commands;

            // Apply fuzzy filter
            const filteredCommandNames = fuzzyFilter(search, commands, {
              extract: (command: any) => command.name,
            }).map((result: any) => result.original);

            return filteredCommandNames;
          },
        },
      ]);

      await new command().run();
    }
  }
}
