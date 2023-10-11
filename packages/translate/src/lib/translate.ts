import { TranslateConfiguration } from './translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
  TranslationString,
} from './translate.interface';
import { translationKeyObjFromLang, translate } from './translate.utils';

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
      throwOnMissing: config?.throwOnMissing ?? false,
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
    key: TranslationString | TranslationKey | undefined | null
  ): string {
    if (!language) {
      return '';
    }

    if (typeof language === 'object') {
      const lang = language.language;
      if (!lang) {
        return '';
      }

      return translate(key, this.translations, lang as any) || '';
    }

    return translate(key, this.translations, language as any) || '';
  }

  translateOrFallback(
    language:
      | string
      | undefined
      | null
      | { language?: string | undefined | null },
    key: TranslationString | TranslationKey | undefined | null
  ): string {
    // Check if language exists in translations
    let _language =
      !!language && typeof language === 'object' ? language.language : language;

    if (!this.translations[_language as keyof Translations]) {
      _language = Object.keys(this.translations)[0];
    }

    return this.translate(language, key);
  }
}

export function configureSkylineTranslation(
  defaultConfig: TranslateConfiguration
): typeof SkylineTranslation {
  class CustomSkylineTranslation<
    Translations extends Record<string, RecursiveStringObject>
  > extends SkylineTranslation<Translations> {
    constructor(
      translations: Translations,
      config?: Partial<TranslateConfiguration>
    ) {
      super(translations, config ?? defaultConfig);
    }
  }

  return CustomSkylineTranslation;
}
