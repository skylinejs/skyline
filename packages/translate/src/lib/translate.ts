import { TranslateConfiguration } from './translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
  TranslationString,
} from './translate.interface';
import {
  translationKeyObjFromLang,
  translate,
  assignOptions,
} from './translate.utils';

/**
 *
 */
export class SkylineTranslation<
  Translations extends Record<string, RecursiveStringObject>
> {
  private readonly config: TranslateConfiguration;
  private keys!: CastToTranslationKeys<Translations[keyof Translations]>;

  constructor(
    private readonly translations: Translations,
    config?: Partial<TranslateConfiguration>
  ) {
    this.config = {
      languages: config?.languages,
      defaultLanguage: config?.defaultLanguage,

      interpolationRegex: config?.interpolationRegex ?? /\{\{([^}]+)\}\}/g,
      throwOnMissingParam: config?.throwOnMissingParam ?? false,
      throwOnMissingTranslation: config?.throwOnMissingTranslation ?? false,
    };
  }

  get key(): CastToTranslationKeys<Translations[keyof Translations]> {
    // Lazy initialization of translation keys object
    if (!this.keys) {
      const firstLang: keyof Translations = Object.keys(this.translations)[0];
      this.keys = translationKeyObjFromLang(this.translations[firstLang]);
    }

    // Return the translation keys object
    return this.keys;
  }

  /**
   * Translate
   * @param language The language to translate to
   * @param key The translation key
   * @returns The translated string
   */
  translate(
    language:
      | keyof Translations
      | undefined
      | null
      | { language?: keyof Translations | undefined | null },
    key: TranslationString | TranslationKey | undefined | null,
    options?: Partial<TranslateConfiguration>
  ): string {
    const config = assignOptions(this.config, options);
    let _language =
      language && typeof language === 'object' ? language.language : language;

    // Fallback to default language
    if (!_language) {
      _language = config.defaultLanguage;
    }

    const result = translate(key, this.translations, _language);

    if (!result && config.throwOnMissingTranslation) {
      throw new Error(
        `Translation for key "${key}" in language "${String(
          _language
        )}" not found`
      );
    }

    return result || '';
  }
}

export function configureSkylineTranslation(
  defaultConfig: Partial<TranslateConfiguration>
): typeof SkylineTranslation {
  class SkylineTranslationWithDefaultConfig<
    Translations extends Record<string, RecursiveStringObject>
  > extends SkylineTranslation<Translations> {
    constructor(
      translations: Translations,
      config?: Partial<TranslateConfiguration>
    ) {
      super(translations, assignOptions(defaultConfig, config));
    }
  }

  return SkylineTranslationWithDefaultConfig;
}
