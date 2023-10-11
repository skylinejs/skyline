import { TranslateConfiguration } from './translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
} from './translate.interface';
import { assignPartialObject } from './util/helper.utils';
import { substituteInterpolations } from './util/interpolation.utils';
import { getTranslationKeysObject, getTranslationTemplate } from './util/translate.utils';

/**
 * The SkylineTranslate class
 */
export class SkylineTranslate<Translations extends Record<string, RecursiveStringObject>> {
  private readonly config: TranslateConfiguration;
  private keys!: CastToTranslationKeys<Translations[keyof Translations]>;

  constructor(
    private readonly translations: Translations,
    config?: Partial<TranslateConfiguration>,
  ) {
    this.config = {
      // === Language ===
      language: config?.language,
      languages: config?.languages,
      fallbackLanguage: config?.fallbackLanguage,

      // === Parameter interpolation ===
      params: config?.params,
      handleMissingParam: config?.handleMissingParam ?? 'keep',
      interpolation: config?.interpolation ?? /\{\{([^}]+)\}\}/g,

      // === Translation keys ===
      handleMissingTranslation: config?.handleMissingTranslation ?? 'keep',

      // === Logging ===
      loggingEnabled: config?.loggingEnabled ?? false,
      logLevels: config?.logLevels ?? [],
    };
  }

  /**
   * Get the translation keys object
   */
  get key(): CastToTranslationKeys<Translations[keyof Translations]> {
    // Lazy initialization of translation keys object
    if (!this.keys) {
      const firstLang: keyof Translations = Object.keys(this.translations)[0];
      const translation = this.translations[firstLang];
      this.keys = getTranslationKeysObject(translation);
    }

    // Return the translation keys object
    return this.keys;
  }

  /**
   * Translate a string using the provided translation key and options
   * @param key The translation key
   * @param options The translation options
   * @returns The translated string
   */
  translate(
    key: TranslationKey | undefined | null,
    options?: Partial<TranslateConfiguration>,
  ): string {
    const config = assignPartialObject(this.config, options);
    const template = getTranslationTemplate({
      key,
      config,
      translations: this.translations,
    });

    const result = substituteInterpolations({ template, config });

    return result || '';
  }
}

/**
 * Create a SkylineTranslate class with default configuration
 * @param defaultConfig The default configuration
 * @returns The SkylineTranslate class with default configuration
 */
export function configureSkylineTranslate(
  defaultConfig: Partial<TranslateConfiguration>,
): typeof SkylineTranslate {
  // Define custom SkylineTranslate class with default config
  class SkylineTranslateWithDefaultConfig<
    Translations extends Record<string, RecursiveStringObject>,
  > extends SkylineTranslate<Translations> {
    constructor(translations: Translations, config?: Partial<TranslateConfiguration>) {
      // Merge default config with provided config
      super(translations, assignPartialObject(defaultConfig, config));
    }
  }

  return SkylineTranslateWithDefaultConfig;
}
