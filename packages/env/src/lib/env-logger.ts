import { EnvConfiguration } from './env-configuration.interface';
import { EnvLogLevel } from './env.interface';

export class EnvLogger {
  private readonly config?: Pick<EnvConfiguration, 'debug' | 'logLevels'>;

  constructor(config?: Partial<Pick<EnvConfiguration, 'debug' | 'logLevels'>>) {
    this.config = {
      debug: config?.debug ?? false,
      logLevels: config?.logLevels ?? Object.values(EnvLogLevel),
    };
  }

  debug(message: string) {
    if (!this.config?.debug) return;
    if (!this.config?.logLevels.includes(EnvLogLevel.DEBUG)) return;

    // eslint-disable-next-line no-console
    console.debug(message);
  }

  log(message: string) {
    if (!this.config?.debug) return;
    if (!this.config?.logLevels.includes(EnvLogLevel.LOG)) return;

    // eslint-disable-next-line no-console
    console.log(message);
  }

  warn(message: string) {
    if (!this.config?.debug) return;
    if (!this.config?.logLevels.includes(EnvLogLevel.WARN)) return;

    // eslint-disable-next-line no-console
    console.warn(message);
  }

  error(message: string) {
    if (!this.config?.debug) return;
    if (!this.config?.logLevels.includes(EnvLogLevel.ERROR)) return;

    // eslint-disable-next-line no-console
    console.error(message);
  }
}
