export interface TranslateConfiguration {
  languages?: { [key: string]: string } | string[];
  defaultLanguage?: string;

  // === Interpolation ===
  interpolation: RegExp | { prefix: string; suffix: string };
  throwOnMissingParam: boolean;
  throwOnMissingTranslation: boolean;
}
