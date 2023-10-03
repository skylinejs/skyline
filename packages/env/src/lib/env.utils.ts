import { EnvConfiguration } from './env-configuration.interface';

/**
 * Parses an environment variable from the process environment.
 * @param variableName The name of the environment variable to parse.
 * @param config The parsing configuration to use.
 * @returns The parsed environment variable value as a string, or undefined if the variable is not set.
 */
export function parseEnvironmentVariable<
  RuntimeEnvironment extends { [key: string]: string }
>(
  variableName: string,
  config: EnvConfiguration<RuntimeEnvironment>
): string | undefined {
  if (config.prefix && !variableName.startsWith(config.prefix.toLowerCase())) {
    throw new Error(
      `Cannot obtain environment variable "${variableName}": has to start with "${config.prefix}"`
    );
  }

  const value = config.processEnv[variableName];
  return value;
}

export function parseBooleanFromString(
  value: string,
  config: EnvConfiguration
): boolean | undefined {
  const booleanTrueValues = config.booleanTrueValues ?? [
    'true',
    '1',
    'yes',
    'y',
    'on',
    'enabled',
    'enable',
    'ok',
    'okay',
  ];
  const booleanFalseValues = config.booleanFalseValues ?? [
    'false',
    '0',
    'no',
    'n',
    'off',
    'disabled',
    'disable',
  ];
  if (booleanTrueValues.includes(value)) return true;
  if (booleanFalseValues.includes(value)) return false;
  return undefined;
}

export function isEnumType<TEnum extends { [key: string]: string }>(
  enumType: TEnum,
  value: unknown
): value is TEnum[keyof TEnum] {
  if (typeof value !== 'string') return false;
  return Object.values(enumType).includes(value);
}
