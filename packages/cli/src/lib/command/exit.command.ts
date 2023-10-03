import { SkylineCliCommand } from './cli-command';

export class ExitCommand extends SkylineCliCommand {
  override async run() {
    console.log('Exit');
    process.exit(0);
  }
}
