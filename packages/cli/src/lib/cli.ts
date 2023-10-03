import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';
import { getCommandPromptMessage } from './cli.utils';

export class SkylineCli {
  private readonly config: CliConfiguration;
  private readonly timeout?: CliInactivityTimeout;
  private exit = false;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {
      cliName: config.cliName ?? 'skyline',
      cliNameColor: config.cliNameColor ?? '#FFFFFF',
      cliNameBackgroundColor: config.cliNameBackgroundColor ?? '#BA2C73',

      commandPromptMessage: config.commandPromptMessage ?? 'Execute a command',
    };

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

  async run() {
    while (!this.exit) {
      // Prompt for command
      const { command } = await inquirer.prompt<{ command: string }>([
        {
          type: 'input',
          name: 'command',
          message: getCommandPromptMessage(this.config),
        },
      ]);
    }
  }
}
