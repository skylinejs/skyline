export interface TranslateConfiguration {
  language?: string;
  languages?: { [key: string]: string } | string[];
  defaultLanguage?: string;

  // === Parameter interpolation ===
  interpolation: RegExp | { prefix: string; suffix: string };
  params?: { [key: string]: string | number | BigInt | undefined };

  throwOnMissingParam: boolean;
  throwOnMissingTranslation: boolean;
}
