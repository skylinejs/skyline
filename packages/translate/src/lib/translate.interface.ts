declare const isTranslationKey: unique symbol;

export type TranslationKey = string & {
  [isTranslationKey]: true;
};

export type TranslationParam = string | number | BigInt | undefined;

export interface TranslationParams {
  [key: string]: TranslationParams | TranslationParam;
}

export interface RecursiveStringObject {
  [key: string]: RecursiveStringObject | string;
}

export type CastToTranslationKeys<O> = {
  [P in keyof O]: O[P] extends string
    ? TranslationKey
    : CastToTranslationKeys<O[P]>;
};
