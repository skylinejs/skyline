import { PassThrough } from 'stream';

export interface CliInactivityTimeoutConfiguration {
  stdinTimeout: number;
  stdoutTimeout: number;
  stderrTimeout: number;
}

export class CliInactivityTimeout {
  private readonly config: CliInactivityTimeoutConfiguration;
  private stdinEmissionAt: number = Date.now();
  private stdoutEmissionAt: number = Date.now();
  private stderrEmissionAt: number = Date.now();

  constructor(config: Partial<CliInactivityTimeoutConfiguration> = {}) {
    // Default to 24 hours
    this.config = {
      stdinTimeout: config.stdinTimeout ?? 1_000 * 60 * 60 * 24,
      stdoutTimeout: config.stdoutTimeout ?? 1_000 * 60 * 60 * 24,
      stderrTimeout: config.stderrTimeout ?? 1_000 * 60 * 60 * 24,
    };
  }

  register() {
    // Read process.stdin
    {
      const _stdin = new PassThrough();
      process.stdin.pipe(_stdin);
      _stdin.on('data', () => {
        this.stdinEmissionAt = Date.now();
        this.checkInactivityTimeouts();
      });
    }

    // Proxy process.stdout.write
    {
      const write = process.stdout.write.bind(process.stdout);
      process.stdout.write = (data: any, ...args: any[]) => {
        this.stdoutEmissionAt = Date.now();
        this.checkInactivityTimeouts();

        return write(data, ...args);
      };
    }

    // Proxy process.stderr.write
    {
      const write = process.stderr.write.bind(process.stderr);
      process.stderr.write = (data: any, ...args: any[]) => {
        this.stderrEmissionAt = Date.now();
        this.checkInactivityTimeouts();

        return write(data, ...args);
      };
    }
  }

  private checkInactivityTimeouts() {
    const now = Date.now();
    if (
      now - this.stdinEmissionAt > this.config.stdinTimeout &&
      now - this.stdoutEmissionAt > this.config.stdoutTimeout &&
      now - this.stderrEmissionAt > this.config.stderrTimeout
    ) {
      process.stdout.write('No activity. Exiting.');
      process.exit(0);
    }
  }
}
