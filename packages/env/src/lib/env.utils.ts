import { EnvConfiguration } from './env-configuration.interface';

export function parseEnvironmentVariable<
  RuntimeEnvironment extends { [key: string]: string }
>(
  variableName: string,
  config: EnvConfiguration<RuntimeEnvironment> = {}
): string | undefined {
  if (config.prefix && !variableName.startsWith(config.prefix.toLowerCase())) {
    throw new Error(
      `Cannot obtain environment variable "${variableName}": has to start with "${config.prefix}"`
    );
  }

  const processEnv = config.processEnv ?? process.env ?? {};
  const value = processEnv[variableName];
  return value;
}

export function isEnumType<TEnum extends { [key: string]: string }>(
  enumType: TEnum,
  value: unknown
): value is TEnum[keyof TEnum] {
  if (typeof value !== 'string') return false;
  return Object.values(enumType).includes(value);
}
