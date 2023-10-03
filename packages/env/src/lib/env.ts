import {
  EnvConfiguration,
  EnvConfigurationInput,
} from './env-configuration.interface';
import { EnvInputValidationError, EnvParsingError } from './env-error';
import {
  BooleanParsingptions,
  NumberParsingOptions,
  StringParsingOptions,
} from './env.interface';
import {
  isEnumType,
  isNotNullish,
  assignOptions,
  parseArrayEnvironmentVariable,
  parseBooleanEnvironmentVariable,
  parseEnvironmentVariable,
} from './env.utils';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  private readonly config: EnvConfiguration<RuntimeEnvironment>;
  constructor(config?: EnvConfigurationInput<RuntimeEnvironment>) {
    this.config = {
      // Runtime environment
      runtime: config?.runtime as RuntimeEnvironment[keyof RuntimeEnvironment],
      runtimes: config?.runtimes,
      processEnv: config?.processEnv ?? process.env ?? {},

      // Variable name
      variableNamePrefix: config?.variableNamePrefix ?? '',
      variableNameIgnoreCasing: config?.variableNameIgnoreCasing ?? false,

      // Variable value
      valueTrim: config?.valueTrim ?? false,
      valueEncoding: config?.valueEncoding,
      valueRemoveAfterParse: config?.valueRemoveAfterParse ?? false,

      // Boolean parsing
      booleanTrueValues: config?.booleanTrueValues ?? [
        'true',
        '1',
        'yes',
        'y',
        'on',
        'enabled',
        'enable',
        'ok',
        'okay',
      ],
      booleanFalseValues: config?.booleanFalseValues ?? [
        'false',
        '0',
        'no',
        'n',
        'off',
        'disabled',
        'disable',
      ],

      // String parsing
      stringMinLength: config?.stringMinLength,
      stringMaxLength: config?.stringMaxLength,
      stringPattern: config?.stringPattern,

      // Number parsing
      numberMinimum: config?.numberMinimum,
      numberMaximum: config?.numberMaximum,
      numberExclusiveMinimum: config?.numberExclusiveMinimum,
      numberExclusiveMaximum: config?.numberExclusiveMaximum,

      // JSON parsing
      jsonMinProperties: config?.jsonMinProperties,
      jsonMaxProperties: config?.jsonMaxProperties,
      jsonRequired: config?.jsonRequired,

      // Array parsing
      arraySeparator: config?.arraySeparator ?? ',',
      arrayMinLength: config?.arrayMinLength,
      arrayMaxLength: config?.arrayMaxLength,
      arrayUniqueItems: config?.arrayUniqueItems,
    };

    // Validate runtime if possible
    if (this.config?.runtime?.trim() === '') {
      throw new EnvInputValidationError(
        `[env.constructor] Runtime was provided but is empty string.`,
        { value: this.config.runtime, parameter: 'runtime' }
      );
    }

    if (this.config?.runtime !== undefined && this.config?.runtimes) {
      if (!this.config.runtimes[this.config.runtime]) {
        throw new EnvInputValidationError(
          [
            `[env.constructor] Invalid runtime: "`,
            this.config.runtime,
            '". Valid runtimes are: "',
            Object.keys(this.config.runtimes).join('", "'),
            '".',
          ].join(''),
          { value: this.config.runtime, parameter: 'runtime' }
        );
      }
    }
  }

  /**
   * Parse an environment variable as a boolean.
   * @param variableName Name of the environment variable to parse
   * @param options Optional options to get default value from
   * @returns The parsed boolean value, or undefined if the variable is not set.
   */
  parseBoolean(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default: boolean | (() => boolean) } & BooleanParsingptions
  ): boolean;
  parseBoolean(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) } & BooleanParsingptions
  ): boolean | undefined;
  parseBoolean(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) } & BooleanParsingptions
  ): boolean | undefined {
    const config = assignOptions(this.config, options);
    const valueStr = parseEnvironmentVariable(variableName, config);
    let value: boolean | undefined = parseBooleanEnvironmentVariable(
      valueStr,
      this.config
    );

    // Environment variable is set but could not be parsed as boolean
    if (valueStr !== undefined && value === undefined) {
      throw new EnvParsingError(
        `[env.parseBoolean] Could not parse value "${valueStr}" as boolean for environment variable "${variableName}".`,
        {
          variableName,
          value: valueStr,
        }
      );
    }

    // Environment variable is not set, try to get default value for runtime
    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }

    return value;
  }

  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default: boolean[] | (() => boolean[]) } & BooleanParsingptions
  ): boolean[];
  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) } & BooleanParsingptions
  ): boolean[] | undefined;
  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) } & BooleanParsingptions
  ): boolean[] | undefined {
    const config = assignOptions(this.config, options);
    const arrayStr = parseEnvironmentVariable(variableName, config);
    const valuesStr = parseArrayEnvironmentVariable(arrayStr, config);

    // Environment variable is set but could not be parsed as an array
    if (arrayStr !== undefined && valuesStr === undefined) {
      throw new EnvParsingError(
        `[env.parseBooleanArray] Could not parse value "${arrayStr}" as array for environment variable "${variableName}".`,
        {
          variableName,
          value: arrayStr,
        }
      );
    }

    let values: boolean[] | undefined = undefined;

    if (valuesStr) {
      values = valuesStr
        .map((valueStr) => parseBooleanEnvironmentVariable(valueStr, config))
        .filter(isNotNullish);

      // Environment variable is set but could not be parsed as boolean
      if (valuesStr.length !== values.length) {
        throw new EnvParsingError(
          `[env.parseBooleanArray] Could not parse value "${arrayStr}" as array of booleans for environment variable "${variableName}".`,
          {
            variableName,
            value: arrayStr,
          }
        );
      }
    }

    if (values === undefined && config?.runtime) {
      const valueOrValueFunc = options
        ? options[config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        values = valueOrValueFunc();
      } else {
        values = valueOrValueFunc;
      }
    }
    return values;
  }

  /**
   * Parse an environment variable as a string.
   * @param variableName Name of the environment variable to parse
   * @param options
   */
  parseString(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default: string | (() => string) } & StringParsingOptions
  ): string;
  parseString(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) } & StringParsingOptions
  ): string | undefined;
  parseString(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) } & StringParsingOptions
  ): string | undefined {
    const config = assignOptions(this.config, options);
    let value: string | undefined = parseEnvironmentVariable(
      variableName,
      config
    );

    if (value === undefined && config?.runtime) {
      const valueOrValueFunc = options
        ? options[config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  /**
   * Parse an environment variable as an array of strings.
   * @param variableName Name of the environment variable to parse
   * @param options
   */
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default: string[] | (() => string[]) } & StringParsingOptions
  ): string[];
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) } & StringParsingOptions
  ): string[] | undefined;
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) } & StringParsingOptions
  ): string[] | undefined {
    const config = assignOptions(this.config, options);
    const valueStr = parseEnvironmentVariable(variableName, config);
    let value: string[] | undefined = valueStr?.split(',') ?? undefined;
    if (value === undefined && config?.runtime) {
      const valueOrValueFunc = options
        ? options[config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  /**
   * Parse an environment variable as an enum.
   * @param variableName Name of the environment variable to parse
   * @param enumType Enum type to parse the environment variable as
   * @param options
   */
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | TEnum[keyof TEnum]
        | (() => TEnum[keyof TEnum]);
    }> & { default: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]) }
  ): TEnum[keyof TEnum];
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | TEnum[keyof TEnum]
        | (() => TEnum[keyof TEnum]);
    }> & { default?: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]) }
  ): TEnum[keyof TEnum] | undefined;
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | TEnum[keyof TEnum]
        | (() => TEnum[keyof TEnum]);
    }> & { default?: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]) }
  ): TEnum[keyof TEnum] | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: TEnum[keyof TEnum] | undefined = isEnumType(enumType, valueStr)
      ? valueStr
      : undefined;

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc as TEnum[keyof TEnum] | undefined;
      }
    }
    return value;
  }

  /**
   * Parse an environment variable as an enum.
   * @param variableName Name of the environment variable to parse
   * @param enumType Enum type to parse the environment variable as
   * @param options
   */
  parseEnumArray<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | Array<TEnum[keyof TEnum]>
        | (() => Array<TEnum[keyof TEnum]>);
    }> & {
      default: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
    }
  ): Array<TEnum[keyof TEnum]>;
  parseEnumArray<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | Array<TEnum[keyof TEnum]>
        | (() => Array<TEnum[keyof TEnum]>);
    }> & {
      default?: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
    }
  ): Array<TEnum[keyof TEnum]> | undefined;
  parseEnumArray<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]:
        | Array<TEnum[keyof TEnum]>
        | (() => Array<TEnum[keyof TEnum]>);
    }> & {
      default?: Array<TEnum[keyof TEnum]> | (() => Array<TEnum[keyof TEnum]>);
    }
  ): Array<TEnum[keyof TEnum]> | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: Array<TEnum[keyof TEnum]> | undefined = undefined;

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc as Array<TEnum[keyof TEnum]> | undefined;
      }
    }
    return value;
  }

  parseNumber(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default: number | (() => number) } & NumberParsingOptions
  ): number;
  parseNumber(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) } & NumberParsingOptions
  ): number | undefined;
  parseNumber(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) } & NumberParsingOptions
  ): number | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: number | undefined = Number(valueStr);

    if (isNaN(value) || !isFinite(value)) {
      value = undefined;
    }

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default: number[] | (() => number[]) } & NumberParsingOptions
  ): number[];
  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) } & NumberParsingOptions
  ): number[] | undefined;
  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) } & NumberParsingOptions
  ): number[] | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: number[] | undefined = [Number(valueStr)];

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  parseJSON<TJson extends object>(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
    }> & { default: TJson | (() => TJson) }
  ): TJson;
  parseJSON<TJson extends object>(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
    }> & { default?: TJson | (() => TJson) }
  ): TJson | undefined;
  parseJSON<TJson extends object>(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
    }> & { default?: TJson | (() => TJson) }
  ): TJson | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: TJson | undefined = undefined;
    if (valueStr) {
      try {
        value = JSON.parse(valueStr);
      } catch (e) {
        value = undefined;
      }
    }

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = options
        ? options[this.config.runtime] ?? options.default
        : undefined;

      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc as TJson | undefined;
      }
    }
    return value;
  }
}
