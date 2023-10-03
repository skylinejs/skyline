import { CliConfiguration } from './cli-configuration.interface';

export class SkylineCli {
  private config: CliConfiguration;

  constructor(config: Partial<CliConfiguration> = {}) {
    this.config = {
      inactivityTimeout: config.inactivityTimeout,
    };
  }
}
