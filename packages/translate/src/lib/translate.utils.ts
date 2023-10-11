import { TranslateConfiguration } from './translate-configuration.interface';
import {
  TranslationKey,
  RecursiveStringObject,
  TranslationParams,
} from './translate.interface';

/**
 * Assigns the properties of object2 to object1, but only if they are not undefined
 * @param target Object to assign to
 * @param source Object to assign from
 * @returns The modified target object with the assigned properties
 */
export function assignPartialObject<T extends object>(
  target: T,
  source: Partial<T> | undefined | null
): T {
  const result: T = { ...target };

  if (!source || typeof source !== 'object') {
    return result;
  }

  Object.keys(source).forEach((_key) => {
    const key = _key as keyof T;
    const value = source[key];
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
}

export function translationKeyObjFromLang(
  translation: RecursiveStringObject,
  parentPaths: string[] = []
): any {
  const translationKeys: { [key: string]: any } = {};

  Object.keys(translation).forEach((key) => {
    if (typeof translation[key] === 'string') {
      translationKeys[key] = [...parentPaths, key].join('.');
    } else {
      translationKeys[key] = translationKeyObjFromLang(
        translation[key] as RecursiveStringObject,
        [...parentPaths, key]
      );
    }
  });

  return translationKeys as any;
}

export function substituteInterpolations(
  str: string,
  params?: TranslationParams
): string {
  // If not parameters are provided, return the string
  if (!params) {
    return str;
  }

  // Substitute handlebars with parameters
  return str.replace(/\{\{([^}]+)\}\}/g, (match) => {
    // Remove the wrapping curly braces, trim surrounding whitespace
    match = match.slice(2, -2).trim();

    // Get the value
    const val = params[match];

    // Replace
    if (val === undefined || val === null) {
      return '';
    }

    return `${val}`;
  });
}

export function getTranslationTemplate(
  fullPath: TranslationKey,
  translations: any,
  language: string | number | symbol
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
  return substituteInterpolations(template, config?.params ?? {});
}
