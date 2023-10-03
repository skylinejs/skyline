import { SkylineCliCommand } from './cli-command';

export class HelpCommand extends SkylineCliCommand {
  static override hidden = true;

  override async run() {
    console.log('Help');
  }
}
