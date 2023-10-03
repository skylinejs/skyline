import chalk from 'chalk';
import { getCommandDisplayName, getCommandIds } from '../cli.utils';
import { SkylineCliCommand } from './cli-command';

export class HelpCommand extends SkylineCliCommand {
  static override hidden = false;

  override async run() {
    // CLI name and version
    console.log(`${this.config.cliName} v${this.config.cliVersion}\n`);

    this.config.commands
      .filter((command) => !command.hidden)
      .forEach((Command) => {
        const command = new Command();
        command.config = this.config;
        command.help(Command);
      });
  }
}
