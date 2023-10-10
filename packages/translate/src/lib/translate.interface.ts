declare const isTranslationKey: unique symbol;

export type TranslationKey = string & {
  [isTranslationKey]: true;
};

export interface TranslationParams {
  [key: string]: string | number | undefined;
}

export interface TranslationString {
  key: TranslationKey;
  params?: TranslationParams;
}

export interface RecursiveStringObject {
  [key: string]: RecursiveStringObject | string;
}

export type CastToTranslationKeys<O> = {
  [P in keyof O]: O[P] extends string
    ? TranslationKey
    : CastToTranslationKeys<O[P]>;
};
