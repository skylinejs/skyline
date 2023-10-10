import {
  TranslationKey,
  TranslationString,
  RecursiveStringObject,
} from './translate.interface';

export function translationKeyObjFromLang(
  langObj: RecursiveStringObject,
  parentPaths: string[] = []
): any {
  const objCopy: { [key: string]: any } = {};

  Object.keys(langObj).forEach((key) => {
    if (typeof langObj[key] === 'string') {
      objCopy[key] = [...parentPaths, key].join('.');
    } else {
      objCopy[key] = translationKeyObjFromLang(
        langObj[key] as RecursiveStringObject,
        [...parentPaths, key]
      );
    }
  });

  return objCopy as any;
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

export function getTranslationTemplate<
  Language extends { [key: string]: string }
>(
  fullPath: TranslationKey,
  languagesDict: { [key in Language[keyof Language]]: any } | undefined,
  language: Language[keyof Language]
): string | undefined {
  if (!languagesDict || !fullPath) {
    return undefined;
  }

  // Start recursion with full language object
  let recursionObj: any = languagesDict[language];

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

export function translate<Language extends { [key: string]: string }>(
  translationInput: TranslationString | TranslationKey | undefined | null,
  languagesDict: any,
  language: Language[keyof Language]
): string | undefined {
  if (translationInput === undefined || translationInput === null) {
    return undefined;
  }

  const fullPath =
    typeof translationInput === 'string'
      ? translationInput
      : translationInput.key;
  const params =
    typeof translationInput === 'string' ? undefined : translationInput.params;

  // Get template for TranslationKey
  const template = getTranslationTemplate(fullPath, languagesDict, language);

  // Check if template could be found
  if (!template) {
    return undefined;
  }

  // Substitute variables
  return substituteHandlebars(template, params);
}
