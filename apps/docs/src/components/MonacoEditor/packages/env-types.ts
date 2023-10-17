export default `
/// <reference types="node" />
declare module "packages/env/src/lib/env.interface" {
    export type ValueEncodingType = 'base64' | 'base64url' | 'hex' | 'url';
    export enum EnvLogLevel {
        DEBUG = "debug",
        LOG = "log",
        WARN = "warn",
        ERROR = "error"
    }
    export interface ParsingOptions {
        /**
         * The prefix of your environment variables.\
         * Provide this option if you want to validate that the environment variable name starts with the provided prefix.
         */
        variableNamePrefix?: string;
        /**
         * Whether to ignore the casing of your environment variable names.\
         * @default false
         */
        variableNameIgnoreCasing?: boolean;
        /**
         * Whether to trim the value of your environment variables.\
         * @default false
         */
        valueTrim?: boolean;
        /**
         * The encoding of your environment variables.\
         * Provide this option if you want to decode the value of your environment variables.\
         * Possible values are 'base64', 'base64url', 'hex' and 'url'.\
         */
        valueEncoding?: ValueEncodingType;
        /**
         * Whether to remove the value of your environment variables after parsing.\
         * Provide this option if you want to remove the value of your environment variables after parsing.\
         * This can improve the security of your application.\
         * @default false
         */
        valueRemoveAfterParse?: boolean;
    }
    export interface BooleanParsingptions extends ParsingOptions {
        /**
         * The values (strings) that are considered as true.
         * @default true, 1, yes, y, on, enabled, enable, ok, okay
         */
        booleanTrueValues?: string[];
        /**
         * The values (strings) that are considered as false.
         * @default false, 0, no, n, off, disabled, disable
         */
        booleanFalseValues?: string[];
    }
    export interface StringParsingOptions extends ParsingOptions {
        /**
         * The minimum length of the string.
         */
        stringMinLength?: number;
        /**
         * The maximum length of the string.
         */
        stringMaxLength?: number;
        /**
         * The pattern of the string.
         */
        stringPattern?: RegExp | string;
    }
    export interface EnumParsingOptions extends ParsingOptions {
        /**
         * Whether to ignore the casing of the enum values.
         */
        enumIgnoreCasing?: boolean;
    }
    export interface NumberParsingOptions extends ParsingOptions {
        /**
         * Whether the number must be an integer.
         */
        numberIsInteger?: boolean;
        /**
         * The minimum value of the number.
         */
        numberMinimum?: number;
        /**
         * The maximum value of the number.
         */
        numberMaximum?: number;
        /**
         * The minimum value of the number (exclusive).
         */
        numberExclusiveMinimum?: number;
        /**
         * The maximum value of the number (exclusive).
         */
        numberExclusiveMaximum?: number;
    }
    export interface JsonParsingOptions extends ParsingOptions {
        /**
         * The minimum number of properties of the JSON object.
         */
        jsonMinProperties?: number;
        /**
         * The maximum number of properties of the JSON object.
         */
        jsonMaxProperties?: number;
        /**
         * The required properties of the JSON object.
         */
        jsonRequired?: string[];
        /**
         * Whether to allow additional properties of the JSON object.
         */
        jsonAdditionalProperties?: boolean;
    }
    export interface ArrayParsingOptions extends ParsingOptions {
        /**
         * The separator of the array.
         */
        arraySeparator?: string;
        /**
         * The minimum length of the array.
         */
        arrayMinLength?: number;
        /**
         * The maximum length of the array.
         */
        arrayMaxLength?: number;
        /**
         * Whether to remove the duplicate items of the array.
         */
        arrayUniqueItems?: boolean;
    }
}
declare module "packages/env/src/lib/env-configuration.interface" {
    import { EnvLogLevel, ValueEncodingType } from "packages/env/src/lib/env.interface";
    export interface EnvConfiguration<RuntimeEnvironment extends {
        [key: string]: string;
    } = {}> {
        /** Whether to enable logging. */
        debug: boolean;
        /** The log levels that are enabled. */
        logLevels: EnvLogLevel[];
        /** The runtime of your application */
        runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;
        /** The possible runtimes of your application.\
         * Provide this option if you want to validate that the runtime is one of the provided runtimes.
         */
        runtimes?: RuntimeEnvironment;
        /** The process environment (probably only useful for testing).\
         * Provide this option if you want to use a custom process environment.
         * @default process.env
         */
        processEnv: NodeJS.ProcessEnv;
        /** Whether to throw an error if the runtime is missing.\
         * Provide this option if you want to throw an error if the runtime is missing.
         * @default false
         */
        throwOnMissingRuntime: boolean;
        /**
         * The prefix of your environment variables.\
         * Provide this option if you want to validate that the environment variable name starts with the provided prefix.
         */
        variableNamePrefix: string;
        /**
         * Whether to ignore the casing of your environment variable names.
         * @default false
         */
        variableNameIgnoreCasing: boolean;
        /**
         * Whether to trim the value of your environment variables.
         * @default false
         */
        valueTrim: boolean;
        /**
         * The encoding of your environment variables.\
         * Provide this option if you want to decode the value of your environment variables.\
         * Possible values are 'base64', 'base64url', 'hex' and 'url'.\
         */
        valueEncoding?: ValueEncodingType;
        /**
         * Whether to remove the value of your environment variables after parsing.\
         * Provide this option if you want to remove the value of your environment variables after parsing.\
         * This can improve the security of your application.
         * @default false
         */
        valueRemoveAfterParse: boolean;
        /**
         * The values (strings) that are considered as true.
         * @default true, 1, yes, y, on, enabled, enable, ok, okay
         */
        booleanTrueValues: string[];
        /**
         * The values (strings) that are considered as false.
         * @default false, 0, no, n, off, disabled, disable
         */
        booleanFalseValues: string[];
        /**
         * The minimum length of the string.
         */
        stringMinLength?: number;
        /**
         * The maximum length of the string.
         */
        stringMaxLength?: number;
        /**
         * The pattern of the string.
         */
        stringPattern?: RegExp | string;
        /**
         * Whether to ignore the casing of the enum values.
         */
        enumIgnoreCasing: boolean;
        /**
         * The minimum value of the number.
         */
        numberMinimum?: number;
        /**
         * The maximum value of the number.
         */
        numberMaximum?: number;
        /**
         * Whether the number must be an integer.
         */
        numberIsInteger: boolean;
        /**
         * The minimum value of the number (exclusive).
         */
        numberExclusiveMinimum?: number;
        /**
         * The maximum value of the number (exclusive).
         */
        numberExclusiveMaximum?: number;
        /**
         * The required properties of the JSON object.
         */
        jsonRequired: string[];
        /**
         * The minimum number of properties of the JSON object.
         */
        jsonMinProperties?: number;
        /**
         * The maximum number of properties of the JSON object.
         */
        jsonMaxProperties?: number;
        /**
         * Whether to allow additional properties of the JSON object.
         */
        jsonAdditionalProperties: boolean;
        /**
         * The separator of the array.
         * @default ,
         */
        arraySeparator: string;
        /**
         * The minimum length of the array.
         */
        arrayMinLength?: number;
        /**
         * The maximum length of the array.
         */
        arrayMaxLength?: number;
        /**
         * Whether to ensure that the array has unique items.
         * @default false
         */
        arrayUniqueItems: boolean;
    }
}
declare module "packages/env/src/lib/env-error" {
    /**
     * Parsing error thrown when a value cannot be parsed from an environment variable.
     */
    export class EnvParsingError extends Error {
        readonly variableName: string;
        readonly value: unknown;
        constructor(message: string, context: {
            variableName: string;
            value: unknown;
        });
    }
    /**
     * Validation error thrown when an environment variable value does not fulfill the validation criteria.
     */
    export class EnvValidationError extends Error {
        readonly variableName: string;
        readonly value: unknown;
        constructor(message: string, context: {
            variableName: string;
            value: unknown;
        });
    }
    /**
     * Validation error thrown when an invalid input is provided to the method.
     */
    export class EnvInputValidationError extends Error {
        readonly parameter: string;
        readonly value: unknown;
        constructor(message: string, context: {
            parameter: string;
            value: unknown;
        });
    }
}
declare module "packages/env/src/lib/env-logger" {
    import { EnvConfiguration } from "packages/env/src/lib/env-configuration.interface";
    export class EnvLogger {
        private readonly config?;
        constructor(config?: Partial<Pick<EnvConfiguration, 'debug' | 'logLevels'>>);
        debug(message: string): void;
        log(message: string): void;
        warn(message: string): void;
        error(message: string): void;
    }
}
declare module "packages/env/src/lib/env.utils" {
    import { EnvConfiguration } from "packages/env/src/lib/env-configuration.interface";
    /**
     * Parses an environment variable from the process environment.
     * @param variableName The name of the environment variable to parse.
     * @param config The parsing configuration to use.
     * @returns The parsed environment variable value as a string, or undefined if the variable is not set.
     */
    export function parseEnvironmentVariable<RuntimeEnvironment extends {
        [key: string]: string;
    }>(variableName: string, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'processEnv' | 'variableNamePrefix' | 'variableNameIgnoreCasing' | 'valueTrim' | 'valueEncoding' | 'valueRemoveAfterParse'>): string | undefined;
    /**
     * Parses a value to a boolean.
     * @param value The value to parse.
     * @param config The parsing configuration to use.
     * @returns The parsed boolean value, or undefined if the value could not be parsed.
     */
    export function parseBooleanValue<RuntimeEnvironment extends {
        [key: string]: string;
    }>(value: unknown, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'booleanTrueValues' | 'booleanFalseValues'>): boolean | undefined;
    export function parseNumberValue(value: unknown): number | undefined;
    export function validateNumberValue<RuntimeEnvironment extends {
        [key: string]: string;
    }>(value: number | undefined, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'numberMinimum' | 'numberMaximum' | 'numberIsInteger' | 'numberExclusiveMinimum' | 'numberExclusiveMaximum'>): true | string;
    export function validateStringValue<RuntimeEnvironment extends {
        [key: string]: string;
    }>(value: string | undefined, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'stringMinLength' | 'stringMaxLength' | 'stringPattern'>): true | string;
    export function parseEnumValue<TEnum extends {
        [key: string]: string;
    }, RuntimeEnvironment extends {
        [key: string]: string;
    }>(enumType: TEnum, value: unknown, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'enumIgnoreCasing'>): TEnum[keyof TEnum] | undefined;
    /**
     * Parses a value to an array of strings.
     * @param value The value to parse.
     * @param config The parsing configuration to use.
     * @returns The parsed array of strings, or undefined if the value could not be parsed.
     */
    export function parseArrayValue<RuntimeEnvironment extends {
        [key: string]: string;
    }>(value: unknown, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'arraySeparator'>): string[] | undefined;
    export function validateArrayValue<RuntimeEnvironment extends {
        [key: string]: string;
    }>(value: string[] | undefined, config: Pick<EnvConfiguration<RuntimeEnvironment>, 'arrayMinLength' | 'arrayMaxLength' | 'arrayUniqueItems'>): true | string;
    export function isNotNullish<T>(el: T | null | undefined): el is T;
    /**
     * Assigns the properties of object2 to object1, but only if they are not undefined
     * @param target Object to assign to
     * @param source Object to assign from
     * @returns The modified target object with the assigned properties
     */
    export function assignPartialObject<T extends object>(target: T, source: Partial<T> | undefined | null): T;
}
declare module "packages/env/src/lib/env" {
    import { EnvConfiguration } from "packages/env/src/lib/env-configuration.interface";
    import { EnvLogger } from "packages/env/src/lib/env-logger";
    import { ArrayParsingOptions, BooleanParsingptions, EnumParsingOptions, JsonParsingOptions, NumberParsingOptions, StringParsingOptions } from "packages/env/src/lib/env.interface";
    export class SkylineEnv<RuntimeEnvironment extends {
        [key: string]: string;
    }> {
        private readonly config;
        private readonly logger;
        constructor(config?: Partial<EnvConfiguration<RuntimeEnvironment>> & {
            logger?: EnvLogger;
        });
        /**
         * Get the runtime environment.
         * @returns The runtime environment or "undefined" if no runtime environment is set.
         */
        get runtime(): RuntimeEnvironment[keyof RuntimeEnvironment] | undefined;
        /**
         * Parse an environment variable as a boolean.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed boolean value, or undefined if the variable is not set.
         */
        parseBoolean(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
        }> & {
            default: boolean | (() => boolean);
        } & BooleanParsingptions): boolean;
        parseBoolean(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
        }> & {
            default?: boolean | (() => boolean);
        } & BooleanParsingptions): boolean | undefined;
        /**
         * Parse an environment variable as an array of booleans.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed boolean array, or undefined if the variable is not set.
         */
        parseBooleanArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
        }> & {
            default: boolean[] | (() => boolean[]);
        } & BooleanParsingptions & ArrayParsingOptions): boolean[];
        parseBooleanArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
        }> & {
            default?: boolean[] | (() => boolean[]);
        } & BooleanParsingptions & ArrayParsingOptions): boolean[] | undefined;
        /**
         * Parse an environment variable as a string.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed string value, or undefined if the variable is not set.
         */
        parseString(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: string | (() => string);
        }> & {
            default: string | (() => string);
        } & StringParsingOptions): string;
        parseString(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: string | (() => string);
        }> & {
            default?: string | (() => string);
        } & StringParsingOptions): string | undefined;
        /**
         * Parse an environment variable as an array of strings.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed string array, or undefined if the variable is not set.
         */
        parseStringArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
        }> & {
            default: string[] | (() => string[]);
        } & StringParsingOptions & ArrayParsingOptions): string[];
        parseStringArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
        }> & {
            default?: string[] | (() => string[]);
        } & StringParsingOptions & ArrayParsingOptions): string[] | undefined;
        /**
         * Parse an environment variable as an enum.
         * @param variableName Name of the environment variable to parse
         * @param enumType Enum type to parse the environment variable as
         * @param options Optional parsing options
         * @returns The parsed enum value, or undefined if the variable is not set.
         */
        parseEnum<TEnum extends {
            [key: string]: string;
        }>(variableName: string, enumType: TEnum, options?: Partial<{
            [key in keyof RuntimeEnvironment]: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]);
        }> & EnumParsingOptions & {
            default: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]);
        }): TEnum[keyof TEnum];
        parseEnum<TEnum extends {
            [key: string]: string;
        }>(variableName: string, enumType: TEnum, options?: Partial<{
            [key in keyof RuntimeEnvironment]: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]);
        }> & EnumParsingOptions & {
            default?: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]);
        }): TEnum[keyof TEnum] | undefined;
        /**
         * Parse an environment variable as an enum.
         * @param variableName Name of the environment variable to parse
         * @param enumType Enum type to parse the environment variable as
         * @param options Optional parsing options
         */
        parseEnumArray<TEnum extends {
            [key: string]: string;
        }>(variableName: string, enumType: TEnum, options?: Partial<{
            [key in keyof RuntimeEnvironment]: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
        }> & EnumParsingOptions & ArrayParsingOptions & {
            default: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
        }): Array<TEnum[keyof TEnum]>;
        parseEnumArray<TEnum extends {
            [key: string]: string;
        }>(variableName: string, enumType: TEnum, options?: Partial<{
            [key in keyof RuntimeEnvironment]: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
        }> & EnumParsingOptions & ArrayParsingOptions & {
            default?: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
        }): Array<TEnum[keyof TEnum]> | undefined;
        /**
         * Parse an environment variable as a number.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed number value, or undefined if the variable is not set.
         */
        parseNumber(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: number | (() => number);
        }> & {
            default: number | (() => number);
        } & NumberParsingOptions): number;
        parseNumber(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: number | (() => number);
        }> & {
            default?: number | (() => number);
        } & NumberParsingOptions): number | undefined;
        /**
         * Parse an environment variable as an array of numbers.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         * @returns The parsed number array, or undefined if the variable is not set.
         */
        parseNumberArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
        }> & {
            default: number[] | (() => number[]);
        } & NumberParsingOptions & ArrayParsingOptions): number[];
        parseNumberArray(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
        }> & {
            default?: number[] | (() => number[]);
        } & NumberParsingOptions & ArrayParsingOptions): number[] | undefined;
        /**
         * Parse an environment variable as a JSON object.
         * @param variableName Name of the environment variable to parse
         * @param options Optional parsing options
         */
        parseJSON<TJson extends object>(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
        }> & {
            default: TJson | (() => TJson);
        } & JsonParsingOptions): TJson;
        parseJSON<TJson extends object>(variableName: string, options?: Partial<{
            [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
        }> & {
            default?: TJson | (() => TJson);
        } & JsonParsingOptions): TJson | undefined;
    }
}
declare module "@skyline-js/env" {
    export * from "packages/env/src/lib/env";
    export * from "packages/env/src/lib/env-error";
    export * from "packages/env/src/lib/env.interface";
    export * from "packages/env/src/lib/env-configuration.interface";
}

`;