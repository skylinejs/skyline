import { PassThrough } from 'stream';

export interface CliInactivityTimeoutConfiguration {
  checkIntervalMs: number;
  stdinTimeoutMs: number;
  stdoutTimeoutMs: number;
  stderrTimeoutMs: number;
}

export class CliInactivityTimeout {
  private readonly config: CliInactivityTimeoutConfiguration;
  private stdinEmissionAt: number = Date.now();
  private stdoutEmissionAt: number = Date.now();
  private stderrEmissionAt: number = Date.now();

  constructor(config: Partial<CliInactivityTimeoutConfiguration> = {}) {
    // Default to 24 hours
    this.config = {
      checkIntervalMs: config.checkIntervalMs ?? 5_000,
      stdinTimeoutMs: config.stdinTimeoutMs ?? 1_000 * 60 * 60 * 24,
      stdoutTimeoutMs: config.stdoutTimeoutMs ?? 1_000 * 60 * 60 * 24,
      stderrTimeoutMs: config.stderrTimeoutMs ?? 1_000 * 60 * 60 * 24,
    };
  }

  register() {
    // Read process.stdin
    {
      const _stdin = new PassThrough();
      process.stdin.pipe(_stdin);
      _stdin.on('data', () => {
        this.stdinEmissionAt = Date.now();
      });
    }

    // Proxy process.stdout.write
    {
      const write = process.stdout.write.bind(process.stdout);
      process.stdout.write = (data: any, ...args: any[]) => {
        this.stdoutEmissionAt = Date.now();

        return write(data, ...args);
      };
    }

    // Proxy process.stderr.write
    {
      const write = process.stderr.write.bind(process.stderr);
      process.stderr.write = (data: any, ...args: any[]) => {
        this.stderrEmissionAt = Date.now();

        return write(data, ...args);
      };
    }

    // Schedule check
    setInterval(
      () => this.checkInactivityTimeouts(),
      this.config.checkIntervalMs
    );
  }

  private checkInactivityTimeouts() {
    const now = Date.now();
    if (
      now - this.stdinEmissionAt > this.config.stdinTimeoutMs &&
      now - this.stdoutEmissionAt > this.config.stdoutTimeoutMs &&
      now - this.stderrEmissionAt > this.config.stderrTimeoutMs
    ) {
      process.stdout.write('No activity. Exiting.');
      process.exit(0);
    }
  }
}
