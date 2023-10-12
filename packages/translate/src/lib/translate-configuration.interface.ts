import { TranslateLogLevel, TranslationParameters } from './translate.interface';

export interface TranslateConfiguration {
  // === Language ===
  /** The language to translate to. If multiple languages are provided, the first available translation is used */
  language?: string;

  /** The language to fallback to if no translations for the selected language are available */
  fallbackLanguage?: string;

  /** Whitelist available languages. If a translations object contains a language that is not in this list, an error is thrown */
  availableLanguages?: { [key: string]: string } | string[];

  // === Parameter interpolation ===
  /** The interpolation pattern, can be a RegExp or an object with prefix and suffix (e.g. { prefix: '{{', suffix: '}}' }) */
  interpolation: RegExp | { prefix: string; suffix: string };

  /** The parameters to use for interpolation. */
  params?: TranslationParameters;

  /** The separator to specify the path to a parameter (e.g. 'user.name' for { user: { name: 'John' } }) */
  paramKeySeparator: string;

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
