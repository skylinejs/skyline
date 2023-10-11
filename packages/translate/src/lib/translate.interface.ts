declare const isTranslationKey: unique symbol;

export type TranslationKey = string & {
  [isTranslationKey]: true;
};

export type TranslationParameter = string | number | BigInt | undefined;

export enum TranslateLogLevel {
  DEBUG = 'DEBUG',
  LOG = 'LOG',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface TranslationParametereters {
  [key: string]: TranslationParametereters | TranslationParameter;
}

export interface RecursiveStringObject {
  [key: string]: RecursiveStringObject | string;
}

export type CastToTranslationKeys<O> = {
  [P in keyof O]: O[P] extends string ? TranslationKey : CastToTranslationKeys<O[P]>;
};
