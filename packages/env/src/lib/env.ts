import { EnvConfiguration } from './env-configuration.interface';

export class SkylineEnv<RuntimeEnvironment extends { [key: string]: string }> {
  constructor(private readonly config?: EnvConfiguration) {}

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
    return undefined;
  }

  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default: number | (() => number) }
  ): string;
  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): string | undefined;
  parseNumber(
    key: string,
    environments: Partial<{
      [key in keyof RuntimeEnvironment]: number | (() => number);
    }> & { default?: number | (() => number) }
  ): string | undefined {
    return undefined;
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
