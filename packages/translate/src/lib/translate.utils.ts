import {
  TranslationKey,
  TranslationString,
  RecursiveStringObject,
} from './translate.interface';

export function assignOptions<T extends object>(config: T, options: any): T {
  const result: any = { ...config };

  if (!options || typeof options !== 'object') {
    return result;
  }

  Object.keys(options).forEach((key) => {
    const value = options[key];
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

export function substituteHandlebars(
  str: string,
  params?: { [key: string]: string | number | undefined }
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

export function translate(
  input: TranslationString | TranslationKey | undefined | null,
  translations: any,
  language: string | number | symbol | null | undefined
): string | undefined {
  if (
    input === undefined ||
    input === null ||
    language === undefined ||
    language === null
  ) {
    return undefined;
  }

  const fullPath = typeof input === 'string' ? input : input.key;
  const params = typeof input === 'string' ? undefined : input.params;

  // Get template for TranslationKey
  const template = getTranslationTemplate(fullPath, translations, language);

  // Check if template could be found
  if (!template) {
    return undefined;
  }

  // Substitute variables
  return substituteHandlebars(template, params);
}
