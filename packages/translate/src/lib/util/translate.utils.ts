import { TranslateConfiguration } from '../translate-configuration.interface';
import {
  CastToTranslationKeys,
  RecursiveStringObject,
  TranslationKey,
} from '../translate.interface';

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

export function getTranslationTemplate({
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

  const language = config?.language ?? config.fallbackLanguage;
  if (!language) {
    return undefined;
  }

  // Start recursion with full language object
  let recursionObj = translations[language];

  for (const fragment of key.split('.')) {
    // Check if wrong path was provided
    if (typeof recursionObj !== 'object') {
      return undefined;
    }

    // Recurse into the language object
    recursionObj = recursionObj[fragment];
  }

  if (typeof recursionObj !== 'string') {
    return undefined;
  }

  const template = recursionObj;
  return template;
}
