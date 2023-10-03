import { CliConfiguration } from './cli-configuration.interface';
import { CliInactivityTimeout } from './cli-inactivity-timeout';
import inquirer from 'inquirer';

export class SkylineCli {
  private config: CliConfiguration;
  private timeout?: CliInactivityTimeout;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {};

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
  }

  async run() {}
}
