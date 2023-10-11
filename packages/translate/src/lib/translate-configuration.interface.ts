import { TranslateLogLevel, TranslationParameters } from './translate.interface';

export interface TranslateConfiguration {
  // === Language ===
  /** The language to translate to */
  language?: string;

  /** Whitelist available languages. If a translations object contains a language that is not in this list, an error is thrown */
  languages?: { [key: string]: string } | string[];

  /** The language to fallback to if no translations for the selected language are available */
  fallbackLanguage?: string;

  // === Parameter interpolation ===
  /** The interpolation pattern, can be a RegExp or an object with prefix and suffix (e.g. { prefix: '{{', suffix: '}}' }) */
  interpolation: RegExp | { prefix: string; suffix: string };

  /** The parameters to use for interpolation. */
  params?: TranslationParameters;

  /**
   * How to handle missing parameters: 'keep' (keep the handlebars), 'remove' (remove the handlebars), 'throw' (throw an error)
   * @default 'keep'
   */
  handleMissingParam: 'keep' | 'remove' | 'throw';

  // === Translation keys ===
  /**
   * How to handle missing translations: 'keep' (keep the translation key), 'remove' (remove the translation key), 'throw' (throw an error)
   */
  handleMissingTranslation: 'keep' | 'remove' | 'throw';

  // === Logging ===
  /**
   * Whether logging is enabled.\
   * Defaults to "true"
   */
  loggingEnabled: boolean;

  /**
   * The log levels to log.\
   * Defaults to all available log levels
   */
  logLevels: TranslateLogLevel[];
}
