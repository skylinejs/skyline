import { EnvConfiguration } from './env-configuration.interface';
import { parseEnvironmentVariable } from './env.utils';

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
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: TEnum | (() => TEnum);
    }> & { default: TEnum | (() => TEnum) }
  ): TEnum;
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: TEnum | (() => TEnum);
    }> & { default?: TEnum | (() => TEnum) }
  ): TEnum | undefined;
  parseEnum<TEnum extends { [key: string]: string }>(
    variableName: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: TEnum | (() => TEnum);
    }> & { default?: TEnum | (() => TEnum) }
  ): TEnum | undefined {
    const valueStr = parseEnvironmentVariable(variableName, this.config);
    let value: TEnum | undefined = valueStr as TEnum | undefined;

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc =
        environments[this.config.runtime] ?? environments.default;
      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc as TEnum;
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
}
