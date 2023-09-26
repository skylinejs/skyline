import {
  CacheLoggerConfiguration,
  CacheLogLevel,
  CacheMessageInfoUnion,
} from './cache-logger.interface';

export class CacheLogger {
  private readonly config?: CacheLoggerConfiguration;
  constructor(config?: Partial<CacheLoggerConfiguration>) {
    this.config = {
      enabled: config?.enabled ?? true,
      logLevels: config?.logLevels ?? Object.values(CacheLogLevel),
    };
  }

  log(message: string, info: CacheMessageInfoUnion) {
    if (!this.config?.enabled) return;
    if (!this.config?.logLevels.includes(CacheLogLevel.LOG)) return;

    // eslint-disable-next-line no-console
    console.log(message);
  }

  warn(message: string, info: CacheMessageInfoUnion) {
    if (!this.config?.enabled) return;
    if (!this.config?.logLevels.includes(CacheLogLevel.WARN)) return;

    // eslint-disable-next-line no-console
    console.warn(message);
  }

  error(message: string, info: CacheMessageInfoUnion) {
    if (!this.config?.enabled) return;
    if (!this.config?.logLevels.includes(CacheLogLevel.ERROR)) return;

    // eslint-disable-next-line no-console
    console.error(message);
  }
}
