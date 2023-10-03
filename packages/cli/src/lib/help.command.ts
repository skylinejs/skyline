import { SkylineCliCommand } from './cli-command';

export class HelpCommand extends SkylineCliCommand {
  static override hidden = false;

  override async run() {
    console.log('Help');
  }
}
