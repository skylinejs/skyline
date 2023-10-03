import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';
import {
  getCommandDisplayName,
  getCommandIds,
  getCommandPromptMessage,
} from './cli.utils';
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { SkylineCliCommand } from './cli-command';
import { fuzzyFilter } from './fuzzy-filter';
import { HelpCommand } from './help.command';

export class SkylineCli {
  private readonly config: CliConfiguration;
  private readonly timeout?: CliInactivityTimeout;

  private exit = false;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {
      // === CLI name ===
      cliName: config.cliName !== undefined ? config.cliName : 'skyline',
      cliNameColor: config.cliNameColor ?? 'black',
      cliNameBackgroundColor: config.cliNameBackgroundColor ?? 'magenta',

      // === Command  ===
      commands: config.commands ?? [HelpCommand],
      commandIdSeparator: config.commandIdSeparator ?? '-',
      commandPathSeparator: config.commandPathSeparator ?? ':',
      commandPromptMessage: config.commandPromptMessage ?? 'Execute a command',
      commandPromptPageSize: config.commandPromptPageSize ?? 10,
      commandDisplayNameCapitalize: config.commandDisplayNameCapitalize ?? true,

      configurationFilePath: config.configurationFilePath ?? '.skylinerc.json',
    };

    // Inquirer
    inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt);

    // Inactivity timeout
    if (config.inactivityTimeout instanceof CliInactivityTimeout) {
      this.timeout = config.inactivityTimeout;
    } else if (typeof config.inactivityTimeout === 'number') {
      this.timeout = new CliInactivityTimeout({
        stdinTimeoutMs: config.inactivityTimeout,
        stdoutTimeoutMs: config.inactivityTimeout,
        stderrTimeoutMs: config.inactivityTimeout,
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
    // Check if commandId was provided via CLI arguments
    let [, , commandId] = process.argv;

    if (commandId) {
      const commands = this.config.commands.map((command) => ({
        ids: getCommandIds(command, this.config),
        command,
      }));

      const command = commands.find((command) =>
        command.ids.includes(commandId)
      )?.command;

      if (!command) {
        console.error(`Unknown command "${commandId}"`);
        process.exit(1);
      }

      await new command().run();
      process.exit(0);
    }

    // Interactive prompting
    while (!this.exit) {
      // Empty line
      process.stdout.write('\n');

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
              name: getCommandDisplayName(command, this.config),
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
