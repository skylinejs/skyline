import { SkylineCliCommand } from './cli-command';

export class HelpCommand extends SkylineCliCommand {
  override async run() {
    console.log('Help');
  }
}
