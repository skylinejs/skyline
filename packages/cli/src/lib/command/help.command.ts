import chalk from 'chalk';
import { getCommandDisplayName, getCommandIds } from '../cli.utils';
import { SkylineCliCommand } from './cli-command';

export class HelpCommand extends SkylineCliCommand {
  static override hidden = false;

  override async run() {
    // CLI name and version
    console.log(`${this.options.cliName} v${this.options.cliVersion}\n`);

    this.options.commands
      .filter((command) => !command.hidden)
      .forEach((Command) => {
        // const command = new Command();
        // command.options = this.options;
        // command.help(Command);
      });
  }
}
