import { SkylineCliCommand } from './cli-command';
import { CliInactivityTimeout } from './cli-inactivity-timeout';

export interface CliConfiguration {
  // === CLI name ===
  cliName: string;
  cliNameColor: string;
  cliNameBackgroundColor: string;

  // === Commands ===
  commands: Array<typeof SkylineCliCommand>;

  // === Command prompt ===
  commandPromptMessage: string;
  commandPromptPageSize: number;

  // === Error handling ===
  exitOnCommandError?: boolean | number;

  /**
   * Inactivity timeout in milliseconds.
   * Defaults to no timeout
   */
  inactivityTimeout?: number | CliInactivityTimeout;

  configurationFilePath: string;
}
