import { CacheLoggerConfiguration, CacheLogLevel, CacheMessageUnion } from './cache-logger.interface';

export class CacheLogger {
  private readonly config: CacheLoggerConfiguration;
  constructor(config?: Partial<CacheLoggerConfiguration>) {
    this.config = {
      enabled: config?.enabled ?? true,
      logLevel: config?.logLevel ?? CacheLogLevel.INFO,
    };
  }

  log(input: CacheMessageUnion): void {
    if (!this.config.enabled) return;

    switch (input.level) {
      case CacheLogLevel.INFO: {
        // eslint-disable-next-line no-console
        console.log(input.message);
        break;
      }

      case CacheLogLevel.WARN: {
        // eslint-disable-next-line no-console
        console.warn(input.message);
        break;
      }

      case CacheLogLevel.ERROR: {
        // eslint-disable-next-line no-console
        console.error(input.message);
        break;
      }
    }
  }
}
