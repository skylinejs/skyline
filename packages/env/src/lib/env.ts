import { EnvConfiguration } from './env-configuration.interface';
import {
  EnvInputValidationError,
  EnvParsingError,
  EnvValidationError,
} from './env-error';
import {
  ArrayParsingOptions,
  BooleanParsingptions,
  NumberParsingOptions,
  StringParsingOptions,
} from './env.interface';
import {
  isEnumType,
  isNotNullish,
  assignOptions,
  parseArrayValue,
  parseBooleanValue,
  parseEnvironmentVariable,
  parseNumberValue,
  validateNumberValue,
  validateArrayValue,
} from './env.utils';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  private readonly config: EnvConfiguration<RuntimeEnvironment>;
  constructor(config?: Partial<EnvConfiguration<RuntimeEnvironment>>) {
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
      numberIsInteger: config?.numberIsInteger ?? false,
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
      arrayUniqueItems: config?.arrayUniqueItems ?? false,
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
   * @param options Optional parsing options
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
    let value: boolean | undefined = parseBooleanValue(valueStr, this.config);

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

  /**
   * Parse an environment variable as an array of booleans.
   * @param variableName Name of the environment variable to parse
   * @param options Optional parsing options
   * @returns The parsed boolean array, or undefined if the variable is not set.
   */
  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default: boolean[] | (() => boolean[]) } & BooleanParsingptions &
      ArrayParsingOptions
  ): boolean[];
  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) } & BooleanParsingptions &
      ArrayParsingOptions
  ): boolean[] | undefined;
  parseBooleanArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) } & BooleanParsingptions &
      ArrayParsingOptions
  ): boolean[] | undefined {
    const config = assignOptions(this.config, options);
    const arrayStr = parseEnvironmentVariable(variableName, config);
    const valuesStr = parseArrayValue(arrayStr, config);

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

    // Validate array value
    const validationResult = validateArrayValue(valuesStr, config);
    if (typeof validationResult === 'string') {
      throw new EnvValidationError(
        `[env.parseBooleanArray] Invalid value "${arrayStr}" for environment variable "${variableName}". ${validationResult}`,
        {
          variableName,
          value: arrayStr,
        }
      );
    }

    let values: boolean[] | undefined = undefined;

    if (valuesStr) {
      values = valuesStr
        .map((valueStr) => parseBooleanValue(valueStr, config))
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
   * @param options Optional parsing options
   * @returns The parsed string value, or undefined if the variable is not set.
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
   * @param options Optional parsing options
   * @returns The parsed string array, or undefined if the variable is not set.
   */
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default: string[] | (() => string[]) } & StringParsingOptions &
      ArrayParsingOptions
  ): string[];
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) } & StringParsingOptions &
      ArrayParsingOptions
  ): string[] | undefined;
  parseStringArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) } & StringParsingOptions &
      ArrayParsingOptions
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
   * @param options Optional parsing options
   * @returns The parsed enum value, or undefined if the variable is not set.
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
   * @param options Optional parsing options
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

  /**
   * Parse an environment variable as a number.
   * @param variableName Name of the environment variable to parse
   * @param options Optional parsing options
   * @returns The parsed number value, or undefined if the variable is not set.
   */
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
    const config = assignOptions(this.config, options);
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: number | undefined = parseNumberValue(valueStr);

    // Environment variable is set but could not be parsed as number
    if (valueStr !== undefined && value === undefined) {
      throw new EnvParsingError(
        `[env.parseNumber] Could not parse value "${valueStr}" as number for environment variable "${variableName}".`,
        {
          variableName,
          value: valueStr,
        }
      );
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

    // Validate number value
    const validationResult = validateNumberValue(value, config);
    if (typeof validationResult === 'string') {
      throw new EnvValidationError(
        `[env.parseNumber] Invalid value "${value}" for environment variable "${variableName}". ${validationResult}`,
        {
          variableName,
          value: valueStr,
        }
      );
    }

    return value;
  }

  /**
   * Parse an environment variable as an array of numbers.
   * @param variableName Name of the environment variable to parse
   * @param options Optional parsing options
   * @returns The parsed number array, or undefined if the variable is not set.
   */
  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default: number[] | (() => number[]) } & NumberParsingOptions &
      ArrayParsingOptions
  ): number[];
  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) } & NumberParsingOptions &
      ArrayParsingOptions
  ): number[] | undefined;
  parseNumberArray(
    variableName: string,
    options?: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) } & NumberParsingOptions &
      ArrayParsingOptions
  ): number[] | undefined {
    const config = assignOptions(this.config, options);
    const arrayStr = parseEnvironmentVariable(variableName, config);
    const valuesStr = parseArrayValue(arrayStr, config);

    // Environment variable is set but could not be parsed as an array
    if (arrayStr !== undefined && valuesStr === undefined) {
      throw new EnvParsingError(
        `[env.parseNumberArray] Could not parse value "${arrayStr}" as array for environment variable "${variableName}".`,
        {
          variableName,
          value: arrayStr,
        }
      );
    }

    // Validate array value
    const validationResult = validateArrayValue(valuesStr, config);
    if (typeof validationResult === 'string') {
      throw new EnvValidationError(
        `[env.parseNumberArray] Invalid value "${arrayStr}" for environment variable "${variableName}". ${validationResult}`,
        {
          variableName,
          value: arrayStr,
        }
      );
    }

    let values: number[] | undefined = undefined;

    if (valuesStr) {
      values = valuesStr
        .map((valueStr) => parseNumberValue(valueStr))
        .filter(isNotNullish);

      // Environment variable is set but could not be parsed as number
      if (valuesStr.length !== values.length) {
        throw new EnvParsingError(
          `[env.parseNumberArray] Could not parse value "${arrayStr}" as array of numbers for environment variable "${variableName}".`,
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

    // Validate number values
    values?.forEach((value) => {
      const validationResult = validateNumberValue(value, config);
      if (typeof validationResult === 'string') {
        throw new EnvValidationError(
          `[env.parseNumberArray] Invalid value "${value}" for environment variable "${variableName}". ${validationResult}`,
          {
            variableName,
            value: arrayStr,
          }
        );
      }
    });

    return values;
  }

  /**
   * Parse an environment variable as a JSON object.
   * @param variableName Name of the environment variable to parse
   * @param options Optional parsing options
   */
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
