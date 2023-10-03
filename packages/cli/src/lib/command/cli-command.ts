import chalk from 'chalk';
import { CliConfiguration } from '../cli-configuration.interface';
import { getCommandDisplayName, getCommandIds } from '../cli.utils';

export class SkylineCliCommand {
  /**
   * The command ID. Default is derived from the class name.
   * Provide an array of strings to register aliases for the command.
   */
  public static commandId?: string | string[];

  /**
   * The command path. Provide this option to group commands into subdirectories.
   */
  public static commandPath?: string | string[];

  /**
   * The display name of the command. Default is derived from the class name.
   */
  public static displayName?: string;

  /**
   * The description of the command.
   */
  public static description?: string;

  /**
   * Examples of how to use the command.
   */
  public static examples?: string[];

  /**
   * Hide the command from the help output and in the interactive CLI.
   */
  public static hidden?: boolean;

  public static flags?: Record<string, any>;

  config!: CliConfiguration;

  async run(): Promise<void> {
    throw new Error('Not implemented');
  }

  help(command: typeof SkylineCliCommand) {
    const output: string[] = [];

    // Command ID
    const commandId =
      command.commandId ?? getCommandIds(command, this.config)[0];
    output.push(chalk.bold(chalk.blue('# ' + commandId)));

    // Display name
    const displayName =
      command.displayName ?? getCommandDisplayName(command, this.config);
    output.push(displayName + '\n');

    // Description
    if (command.description) {
      output.push(command.description + '\n');
    }

    console.log(output.join('\n'));
  }
}
