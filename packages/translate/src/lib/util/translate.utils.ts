import { TranslateConfiguration } from '../translate-configuration.interface';
import {
  TranslationKey,
  RecursiveStringObject,
  TranslationParams,
  CastToTranslationKeys,
} from '../translate.interface';
import { substituteInterpolations } from './interpolation.utils';

/**
 * Create a translation keys object with the same structure as the translation object, but with the values replaced by the translation keys
 * @param translation The translation object
 * @param parentPaths The parent paths (used for recursion)
 * @returns The translation keys object
 */
export function getTranslationKeysObject<
  Translations extends Record<string, RecursiveStringObject>,
>(
  translation: RecursiveStringObject,
  parentPaths: string[] = [],
): CastToTranslationKeys<Translations[keyof Translations]> {
  const translationKeys: { [key: string]: any } = {};

  Object.keys(translation).forEach((key) => {
    if (typeof translation[key] === 'string') {
      translationKeys[key] = [...parentPaths, key].join('.');
    } else {
      translationKeys[key] = getTranslationKeysObject(translation[key] as RecursiveStringObject, [
        ...parentPaths,
        key,
      ]);
    }
  });

  return translationKeys as CastToTranslationKeys<Translations[keyof Translations]>;
}

function getTranslationTemplate(
  fullPath: TranslationKey,
  translations: any,
  language: string | number | symbol,
): string | undefined {
  if (!translations || !fullPath) {
    return undefined;
  }

  // Start recursion with full language object
  let recursionObj = translations[language];

  for (const key of fullPath.split('.')) {
    // Check if wrong path was provided
    if (typeof recursionObj !== 'object') {
      return undefined;
    }

    // Recurse into the language object
    recursionObj = recursionObj[key];
  }

  if (typeof recursionObj !== 'string') {
    return undefined;
  }

  const template = recursionObj;
  return template;
}

export function translate({
  key,
  config,
  translations,
}: {
  translations: any;
  config: TranslateConfiguration;
  key: TranslationKey | undefined | null;
}): string | undefined {
  if (!key) {
    return undefined;
  }

  const language = config?.language ?? config.defaultLanguage;
  if (!language) {
    return undefined;
  }

  // Get template for TranslationKey
  const template = getTranslationTemplate(key, translations, language);

  // Check if template could be found
  if (!template) {
    return undefined;
  }

  // Substitute variables
  return substituteInterpolations({ template, config });
}
