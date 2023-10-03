import { CliInactivityTimeout } from './cli-inactivity-timeout';

export interface CliConfiguration {
  /**
   * Inactivity timeout in milliseconds.
   * Defaults to no timeout
   */
  inactivityTimeout?: number | CliInactivityTimeout;
}
