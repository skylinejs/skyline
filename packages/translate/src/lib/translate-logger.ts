import { TranslateConfiguration } from './translate-configuration.interface';
import { TranslateLogLevel } from './translate.interface';

export class TranslateLogger {
  private readonly config?: Pick<TranslateConfiguration, 'loggingEnabled' | 'logLevels'>;

  constructor(config?: Partial<Pick<TranslateConfiguration, 'loggingEnabled' | 'logLevels'>>) {
    this.config = {
      loggingEnabled: config?.loggingEnabled ?? false,
      logLevels: config?.logLevels ?? Object.values(TranslateLogLevel),
    };
  }

  debug(message: string) {
    if (!this.config?.loggingEnabled) return;
    if (!this.config?.logLevels.includes(TranslateLogLevel.DEBUG)) return;

    // eslint-disable-next-line no-console
    console.debug(message);
  }

  log(message: string) {
    if (!this.config?.loggingEnabled) return;
    if (!this.config?.logLevels.includes(TranslateLogLevel.LOG)) return;

    // eslint-disable-next-line no-console
    console.log(message);
  }

  warn(message: string) {
    if (!this.config?.loggingEnabled) return;
    if (!this.config?.logLevels.includes(TranslateLogLevel.WARN)) return;

    // eslint-disable-next-line no-console
    console.warn(message);
  }

  error(message: string) {
    if (!this.config?.loggingEnabled) return;
    if (!this.config?.logLevels.includes(TranslateLogLevel.ERROR)) return;

    // eslint-disable-next-line no-console
    console.error(message);
  }
}
