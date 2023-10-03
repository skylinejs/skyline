export class SkylineCliCommand {
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

  /**
   * The description of the command.
   */
  public static description?: string;

  /**
   * Examples of how to use the command.
   */
  public static examples?: string[];

  /**
   * Hide the command from the help output and in the interactive CLI.
   */
  public static hidden?: boolean;

  public static flags?: Record<string, any>;

  async run(): Promise<void> {
    throw new Error('Not implemented');
  }
}
