import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';
import { getCommandDisplayName, getCommandIds, getCommandPromptMessage } from './cli.utils';
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { SkylineCliCommand } from './command/cli-command';
import { fuzzyFilter } from './fuzzy-filter';
import { HelpCommand } from './command/help.command';
import { ExitCommand } from './command/exit.command';
import { Config } from '@oclif/core';
import { oclifAdapter } from './oclif-adapter';

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
      commands: config.commands ?? [],
      commandIdSeparator: config.commandIdSeparator ?? '-',
      commandPathSeparator: config.commandPathSeparator ?? ':',
      commandPromptMessage: config.commandPromptMessage ?? 'Execute a command',
      commandPromptPageSize: config.commandPromptPageSize ?? 10,
      commandDisplayNameCapitalize: config.commandDisplayNameCapitalize ?? true,

      // === Providers ===
      providers: config.providers ?? [],

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

    // Register commands if none were provided
    if (this.config.commands.length === 0) {
      this.registerCommand(HelpCommand);
      this.registerCommand(ExitCommand);
    }
  }

  /**
   * Register a command class to be available in the CLI.
   * @param command Command class
   */
  registerCommand(command: typeof SkylineCliCommand) {
    if (this.config.commands.find((c) => c === command)) return;
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

      const Command = commands.find((command) => command.ids.includes(commandId))?.command;

      if (!Command) {
        console.error(`Unknown command "${commandId}"`);
        process.exit(1);
      }

      await this.runCommand(Command);
      process.exit(0);
    }

    const commands = this.config.commands
      .filter((command) => !command.hidden)
      .map((command) => ({
        name: getCommandDisplayName(command, this.config),
        value: command,
      }));

    // Interactive prompting
    while (!this.exit) {
      // Empty line
      process.stdout.write('\n');

      // Prompt for command
      const { Command } = await inquirer.prompt<{
        Command: typeof SkylineCliCommand;
      }>([
        {
          type: 'autocomplete',
          name: 'Command',
          pageSize: this.config.commandPromptPageSize,
          message: getCommandPromptMessage(this.config),
          source: (_: unknown, search: string) => {
            search = (search || '').trim();
            if (!search) return commands;

            // Apply fuzzy filter
            const filteredCommandNames = fuzzyFilter(search, commands, {
              extract: (command: { name: string }) => command.name,
            }).map((result: any) => result.original);

            return filteredCommandNames;
          },
        },
      ]);

      await this.runCommand(Command);
    }
  }

  async runCommand(Command: typeof SkylineCliCommand) {
    await oclifAdapter.loadOclifConfig();
    const command = new Command();
    command.options = this.config;
    const result = await command.run();
    return result;
  }
}
