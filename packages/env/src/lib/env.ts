import { EnvConfiguration } from './env-configuration.interface';
import { parseEnvironmentVariable } from './env.utils';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  constructor(private readonly config?: EnvConfiguration<RuntimeEnvironment>) {}

  parseString(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default: string | (() => string) }
  ): string;
  parseString(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) }
  ): string | undefined;
  parseString(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: string | (() => string);
    }> & { default?: string | (() => string) }
  ): string | undefined {
    let value: string | undefined = parseEnvironmentVariable(key, this.config);
    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = environments[this.config.runtime];
      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default: number | (() => number) }
  ): number;
  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): number | undefined;
  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): number | undefined {
    const valueStr = parseEnvironmentVariable(key, this.config);
    let value: number | undefined = Number(valueStr);

    if (isNaN(value) || !isFinite(value)) {
      value = undefined;
    }

    if (value === undefined && this.config?.runtime) {
      const valueOrValueFunc = environments[this.config.runtime];
      if (typeof valueOrValueFunc === 'function') {
        value = valueOrValueFunc();
      } else {
        value = valueOrValueFunc;
      }
    }
    return value;
  }

  parseBoolean(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default: boolean | (() => boolean) }
  ): string;
  parseBoolean(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): string | undefined;
  parseBoolean(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: boolean | (() => boolean);
    }> & { default?: boolean | (() => boolean) }
  ): string | undefined {
    return undefined;
  }
}
