import { TranslateConfiguration } from './translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
} from './translate.interface';
import { assignPartialObject } from './util/helper.utils';
import { getTranslationKeysObject, translate } from './util/translate.utils';

/**
 *
 */
export class SkylineTranslation<Translations extends Record<string, RecursiveStringObject>> {
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
      interpolation: config?.interpolation ?? /\{\{([^}]+)\}\}/g,
      handleMissingParam: config?.handleMissingParam ?? 'keep',

      // === Translation keys ===
      handleMissingTranslation: config?.handleMissingTranslation ?? 'keep',

      // === Logging ===
      logMissingTranslations: config?.logMissingTranslations ?? true,
    };
  }

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
   * Translate
   * @param key The translation key
   * @param options The translation options
   * @returns The translated string
   */
  translate(
    key: TranslationKey | undefined | null,
    options?: Partial<TranslateConfiguration>,
  ): string {
    const config = assignPartialObject(this.config, options);
    const result = translate({
      key,
      config,
      translations: this.translations,
    });

    return result || '';
  }
}

export function configureSkylineTranslation(
  defaultConfig: Partial<TranslateConfiguration>,
): typeof SkylineTranslation {
  // Define custom SkylineTranslation class with default config
  class SkylineTranslationWithDefaultConfig<
    Translations extends Record<string, RecursiveStringObject>,
  > extends SkylineTranslation<Translations> {
    constructor(translations: Translations, config?: Partial<TranslateConfiguration>) {
      // Merge default config with provided config
      super(translations, assignPartialObject(defaultConfig, config));
    }
  }

  return SkylineTranslationWithDefaultConfig;
}
