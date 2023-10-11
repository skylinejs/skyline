export interface TranslateConfiguration {
  languages?: { [key: string]: string } | string[];
  defaultLanguage?: string;

  interpolationRegex: RegExp;
  throwOnMissingParam: boolean;
  throwOnMissingTranslation: boolean;
}
