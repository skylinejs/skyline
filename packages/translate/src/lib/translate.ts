import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
  TranslationString,
} from './translate.interface';
import { translationKeyObjFromLang, translate } from './translate.utils';

export class SkylineTranslation<
  Translations extends Record<string, RecursiveStringObject>
> {
  private keys!: CastToTranslationKeys<Translations[keyof Translations]>;

  constructor(private readonly translations: Translations) {}

  get key(): CastToTranslationKeys<Translations[keyof Translations]> {
    // Lazy initialization of translation keys object
    if (!this.keys) {
      const firstLang: keyof Translations = Object.keys(this.translations)[0];
      this.keys = translationKeyObjFromLang(
        this.translations[firstLang] as any
      );
    }

    return this.keys;
  }

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
}
