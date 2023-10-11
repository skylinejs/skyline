import { TranslateConfiguration } from './translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
} from './translate.interface';
import {
  translationKeyObjFromLang,
  translate,
  assignPartialObject,
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

      interpolation: config?.interpolation ?? /\{\{([^}]+)\}\}/g,
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
    key: TranslationKey | undefined | null,
    options?: Partial<TranslateConfiguration>
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
  defaultConfig: Partial<TranslateConfiguration>
): typeof SkylineTranslation {
  class SkylineTranslationWithDefaultConfig<
    Translations extends Record<string, RecursiveStringObject>
  > extends SkylineTranslation<Translations> {
    constructor(
      translations: Translations,
      config?: Partial<TranslateConfiguration>
    ) {
      super(translations, assignPartialObject(defaultConfig, config));
    }
  }

  return SkylineTranslationWithDefaultConfig;
}
