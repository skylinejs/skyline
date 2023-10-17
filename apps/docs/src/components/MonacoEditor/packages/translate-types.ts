export default `
declare module "packages/translate/src/lib/translate.interface" {
    const isTranslationKey: unique symbol;
    export type TranslationKey = string & {
        [isTranslationKey]: true;
    };
    export type TranslationParameter = string | number | BigInt | undefined;
    export enum TranslateLogLevel {
        DEBUG = "DEBUG",
        LOG = "LOG",
        WARN = "WARN",
        ERROR = "ERROR"
    }
    export interface TranslationParameters {
        [key: string]: TranslationParameters | TranslationParameter;
    }
    export interface RecursiveStringObject {
        [key: string]: RecursiveStringObject | string;
    }
    export type CastToTranslationKeys<O> = {
        [P in keyof O]: O[P] extends string ? TranslationKey : CastToTranslationKeys<O[P]>;
    };
}
declare module "packages/translate/src/lib/translate-configuration.interface" {
    import { TranslateLogLevel, TranslationParameters } from "packages/translate/src/lib/translate.interface";
    export interface TranslateConfiguration {
        /** The language to translate to. If multiple languages are provided, the first available translation is used */
        language?: string;
        /** The language to fallback to if no translations for the selected language are available */
        fallbackLanguage?: string;
        /** Whitelist available languages. If a translations object contains a language that is not in this list, an error is thrown */
        availableLanguages?: {
            [key: string]: string;
        } | string[];
        /** Whether to use fuzzy matching for the language: ignore case, whitespaces, "*" wildcard support, fallback to same language with no culture or another culture */
        languageFuzzyMatching?: boolean;
        /** The interpolation pattern, can be a RegExp or an object with prefix and suffix (e.g. { prefix: '{{', suffix: '}}' }) */
        interpolation: RegExp | {
            prefix: string;
            suffix: string;
        };
        /** The parameters to use for interpolation. */
        params?: TranslationParameters;
        /** The separator to specify the path to a parameter (e.g. 'user.name' for { user: { name: 'John' } }) */
        paramKeySeparator: string;
        /**
         * How to handle missing parameters: 'keep' (keep the handlebars), 'remove' (remove the handlebars), 'throw' (throw an error)
         * @default 'keep'
         */
        handleMissingParam: 'keep' | 'remove' | 'throw';
        /**
         * How to handle missing translations: 'keep' (keep the translation key), 'remove' (remove the translation key), 'throw' (throw an error)
         */
        handleMissingTranslation: 'keep' | 'remove' | 'throw';
        /**
         * Whether logging is enabled.\
         * Defaults to "true"
         */
        loggingEnabled: boolean;
        /**
         * The log levels to log.\
         * Defaults to all available log levels
         */
        logLevels: TranslateLogLevel[];
    }
}
declare module "packages/translate/src/lib/util/helper.utils" {
    /**
     * Assigns the properties of object2 to object1, but only if they are not undefined
     * @param target Object to assign to
     * @param source Object to assign from
     * @returns The modified target object with the assigned properties
     */
    export function assignPartialObject<T extends object>(target: T, source: Partial<T> | undefined | null): T;
}
declare module "packages/translate/src/lib/util/interpolation.utils" {
    import { TranslateConfiguration } from "packages/translate/src/lib/translate-configuration.interface";
    export function substituteInterpolations({ template, config, }: {
        template: string | undefined;
        config: TranslateConfiguration;
    }): string | undefined;
}
declare module "packages/translate/src/lib/util/translate.utils" {
    import { TranslateConfiguration } from "packages/translate/src/lib/translate-configuration.interface";
    import { CastToTranslationKeys, RecursiveStringObject, TranslationKey } from "packages/translate/src/lib/translate.interface";
    /**
     * Create a translation keys object with the same structure as the translation object, but with the values replaced by the translation keys
     * @param translation The translation object
     * @param parentPaths The parent paths (used for recursion)
     * @returns The translation keys object
     */
    export function getTranslationKeysObject<Translations extends Record<string, RecursiveStringObject>>(translation: RecursiveStringObject, parentPaths?: string[]): CastToTranslationKeys<Translations[keyof Translations]>;
    export function getTranslationTemplate({ key, config, translations, }: {
        translations: any;
        config: TranslateConfiguration;
        key: TranslationKey | undefined | null;
    }): string | undefined;
}
declare module "packages/translate/src/lib/translate" {
    import { TranslateConfiguration } from "packages/translate/src/lib/translate-configuration.interface";
    import { CastToTranslationKeys, RecursiveStringObject, TranslationKey } from "packages/translate/src/lib/translate.interface";
    /**
     * The SkylineTranslate class
     */
    export class SkylineTranslate<Translations extends Record<string, RecursiveStringObject>> {
        private readonly translations;
        private readonly config;
        private keys;
        constructor(translations: Translations, config?: Partial<TranslateConfiguration>);
        /**
         * Get the translation keys object
         */
        get key(): CastToTranslationKeys<Translations[keyof Translations]>;
        /**
         * Translate a string using the provided translation key and options
         * @param key The translation key
         * @param options The translation options
         * @returns The translated string
         */
        translate(key: TranslationKey | undefined | null, options?: Partial<TranslateConfiguration>): string;
    }
    /**
     * Create a SkylineTranslate class with default configuration
     * @param defaultConfig The default configuration
     * @returns The SkylineTranslate class with default configuration
     */
    export function configureSkylineTranslate(defaultConfig: Partial<TranslateConfiguration>): typeof SkylineTranslate;
}
declare module "packages/translate/src/lib/translate-logger" {
    import { TranslateConfiguration } from "packages/translate/src/lib/translate-configuration.interface";
    export class TranslateLogger {
        private readonly config?;
        constructor(config?: Partial<Pick<TranslateConfiguration, 'loggingEnabled' | 'logLevels'>>);
        debug(message: string): void;
        log(message: string): void;
        warn(message: string): void;
        error(message: string): void;
    }
}
declare module "packages/translate/src/lib/util/http-request.utils" {
    /**
     * Parse HTTP header "Accept-Language" to get the languages accepted by the client.
     * @param headers The HTTP request's headers object or the "Accept-Language" header value
     * @returns The languages accepted by the client, sorted by q value (highest q value first)
     */
    export function parseHttpHeaderAcceptLanguages(headers?: {
        [key: string]: string | string[];
    } | string | string[] | null | undefined): string[];
}
declare module "packages/translate/src/lib/util/browser.utils" {
    export function getBrowserLanguage(): string | undefined;
    export function getBrowserCultureLanguage(): string | undefined;
}
declare module "@skyline-js/translate" {
    export * from "packages/translate/src/lib/translate";
    export * from "packages/translate/src/lib/translate-configuration.interface";
    export * from "packages/translate/src/lib/translate-logger";
    export { TranslationKey, TranslationParameter, TranslationParameters, } from "packages/translate/src/lib/translate.interface";
    export { parseHttpHeaderAcceptLanguages } from "packages/translate/src/lib/util/http-request.utils";
    export { getBrowserLanguage, getBrowserCultureLanguage } from "packages/translate/src/lib/util/browser.utils";
}

`;