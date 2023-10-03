export class SkylineCliCommand {
  /**
   * The command ID. Default is derived from the class name.
   * Provide an array of strings to register aliases for the command.
   */
  static commandId?: string | string[];

  /**
   * The display name of the command. Default is derived from the class name.
   */
  static displayName?: string;

  async run(): Promise<void> {
    throw new Error('Not implemented');
  }
}
