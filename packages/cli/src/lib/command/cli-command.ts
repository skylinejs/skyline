import { Command } from '@oclif/core';
import { CliConfiguration } from '../cli-configuration.interface';
import { Config } from '@oclif/core';
import { oclifAdapter } from '../oclif-adapter';

export class SkylineCliCommand extends Command {
  /**
   * The command ID. Default is derived from the class name.
   * Provide an array of strings to register aliases for the command.
   */
  public static commandId?: string | string[];

  /**
   * The command path. Provide this option to group commands into subdirectories.
   */
  public static commandPath?: string | string[];

  /**
   * The display name of the command. Default is derived from the class name.
   */
  public static displayName?: string;

  options!: CliConfiguration;

  constructor() {
    super(process.argv.slice(3), oclifAdapter.getOclifConfig());
  }

  async run(): Promise<void> {
    throw new Error(`${this.id}: Not implemented`);
  }
}
