import {
  EnvConfiguration,
  EnvConfigurationInput,
} from './env-configuration.interface';
import { EnvInputValidationError, EnvParsingError } from './env-error';
import {
  isEnumType,
  parseBooleanEnvironmentVariable,
  parseEnvironmentVariable,
} from './env.utils';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  private readonly config: EnvConfiguration<RuntimeEnvironment>;
  constructor(config?: EnvConfigurationInput<RuntimeEnvironment>) {
    this.config = {
      runtime: config?.runtime as RuntimeEnvironment[keyof RuntimeEnvironment],
      runtimes: config?.runtimes,
      processEnv: config?.processEnv ?? process.env ?? {},

      prefix: config?.prefix ?? '',

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
    };

    // Validate runtime if possible
    if (this.config?.runtime?.trim() === '') {
      throw new EnvInputValidationError(
        `[SkylineEnv.constructor] Runtime was provided but is empty string.`,
        { value: this.config.runtime, parameter: 'runtime' }
      );
    }

    if (this.config?.runtime !== undefined && this.config?.runtimes) {
      if (!this.config.runtimes[this.config.runtime]) {
        throw new EnvInputValidationError(
          [
            `[SkylineEnv.constructor] Invalid runtime: "`,
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
   * Parse an environment variable as a string.
   * @param variableName Name of the environment variable to parse
   * @param environments
   */
  parseString(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default: string | (() => string) }
  ): string;
  parseString(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) }
  ): string | undefined;
  parseString(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) }
  ): string | undefined {
    let value: string | undefined = parseEnvironmentVariable(
      variableName,
      this.config
    );
    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
   * @param environments
   */
  parseStringArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default: string[] | (() => string[]) }
  ): string[];
  parseStringArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) }
  ): string[] | undefined;
  parseStringArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string[] | (() => string[]);
    }> & { default?: string[] | (() => string[]) }
  ): string[] | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: string[] | undefined = valueStr?.split(',') ?? undefined;
    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
   * @param environments
   */
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]:
        | TEnum[keyof TEnum]
        | (() => TEnum[keyof TEnum]);
    }> & { default: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]) }
  ): TEnum[keyof TEnum];
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]:
        | TEnum[keyof TEnum]
        | (() => TEnum[keyof TEnum]);
    }> & { default?: TEnum[keyof TEnum] | (() => TEnum[keyof TEnum]) }
  ): TEnum[keyof TEnum] | undefined;
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    environments: Partial<{
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
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
   * @param environments
   */
  parseEnumArray<TEnum extends { [key: string]: string }>(
    variableName: string,
    enumType: TEnum,
    environments: Partial<{
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
    environments: Partial<{
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
    environments: Partial<{
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
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default: number | (() => number) }
  ): number;
  parseNumber(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): number | undefined;
  parseNumber(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): number | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: number | undefined = Number(valueStr);

    if (isNaN(value) || !isFinite(value)) {
      value = undefined;
    }

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default: number[] | (() => number[]) }
  ): number[];
  parseNumberArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) }
  ): number[] | undefined;
  parseNumberArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number[] | (() => number[]);
    }> & { default?: number[] | (() => number[]) }
  ): number[] | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: number[] | undefined = [Number(valueStr)];

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  parseBoolean(
    variableName: string,
    environments?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default: boolean | (() => boolean) }
  ): boolean;
  parseBoolean(
    variableName: string,
    environments?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): boolean | undefined;
  parseBoolean(
    variableName: string,
    environments?: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): boolean | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: boolean | undefined = parseBooleanEnvironmentVariable(
      valueStr,
      this.config
    );

    // Environment variable is set but could not be parsed as boolean
    if (valueStr !== undefined && value === undefined) {
      throw new EnvParsingError(
        `[SkylineEnv.parseBoolean] Could not parse value "${valueStr}" as boolean for environment variable "${variableName}".`,
        {
          variableName,
          value: valueStr,
        }
      );
    }

    // Environment variable is not set, try to get default value for runtime
    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = environments
        ? environments[this.config.runtime] ?? environments.default
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
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default: boolean[] | (() => boolean[]) }
  ): boolean[];
  parseBooleanArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) }
  ): boolean[] | undefined;
  parseBooleanArray(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean[] | (() => boolean[]);
    }> & { default?: boolean[] | (() => boolean[]) }
  ): boolean[] | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: boolean[] | undefined = [Boolean(valueStr)];

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
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
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
    }> & { default: TJson | (() => TJson) }
  ): TJson;
  parseJSON<TJson extends object>(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: TJson | (() => TJson);
    }> & { default?: TJson | (() => TJson) }
  ): TJson | undefined;
  parseJSON<TJson extends object>(
    variableName: string,
    environments: Partial<{
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
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc as TJson | undefined;
      }
    }
    return value;
  }
}
