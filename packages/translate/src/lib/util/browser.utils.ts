function isBrowser() {
  return typeof window !== 'undefined';
}

export function getBrowserLanguage(): string | undefined {
  const cultureLanguage = getBrowserCultureLanguage();
  if (!cultureLanguage || !isBrowser()) {
    return undefined;
  }

  let language = cultureLanguage;
  if (language.indexOf('-') !== -1) {
    language = language.split('-')[0];
  }

  if (language.indexOf('_') !== -1) {
    language = language.split('_')[0];
  }

  return language;
}

export function getBrowserCultureLanguage(): string | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  const navigator = window?.navigator;
  return navigator?.languages?.[0] ?? navigator?.language;
}
