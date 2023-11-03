import type { SkylineCliCommand } from './command/cli-command';
import { CliInactivityTimeout } from './cli-inactivity-timeout';

export interface CliConfiguration {
  cliVersion?: string;

  // === CLI name ===
  cliName: string | null;
  cliNameColor:
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'grey'
    | 'blackBright'
    | 'redBright'
    | 'greenBright'
    | 'yellowBright'
    | 'blueBright'
    | 'magentaBright'
    | 'cyanBright'
    | 'whiteBright';
  cliNameBackgroundColor:
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'grey'
    | 'blackBright'
    | 'redBright'
    | 'greenBright'
    | 'yellowBright'
    | 'blueBright'
    | 'magentaBright'
    | 'cyanBright'
    | 'whiteBright';

  // === Commands ===
  commands: Array<typeof SkylineCliCommand>;
  commandPromptMessage: string;
  commandPromptPageSize: number;
  commandIdSeparator: string;
  commandPathSeparator: string;
  commandDisplayNameCapitalize: boolean;

  // === Providers ===
  providers: Array<unknown>;

  // === Error handling ===
  exitOnCommandError?: boolean | number;

  /**
   * Inactivity timeout in milliseconds.
   * Defaults to no timeout
   */
  inactivityTimeout?: number | CliInactivityTimeout;

  configurationFilePath: string;
}
