import { EnvConfiguration } from './env-configuration.interface';
import { isEnumType, parseEnvironmentVariable } from './env.utils';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  constructor(private readonly config?: EnvConfiguration<RuntimeEnvironment>) {}

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

  parseBoolean(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default: boolean | (() => boolean) }
  ): boolean;
  parseBoolean(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): boolean | undefined;
  parseBoolean(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): boolean | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: boolean | undefined = Boolean(valueStr);

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
