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
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    'variableNamePrefix' | 'processEnv'
  >
): string | undefined {
  if (
    config.variableNamePrefix &&
    !variableName.startsWith(config.variableNamePrefix.toLowerCase())
  ) {
    throw new Error(
      `Cannot obtain environment variable "${variableName}": has to start with "${config.variableNamePrefix}"`
    );
  }

  const value = config.processEnv[variableName];
  return value;
}

export function parseBooleanEnvironmentVariable<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: unknown,
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    'booleanTrueValues' | 'booleanFalseValues'
  >
): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === 'string') {
    if (config.booleanTrueValues.includes(value.trim())) return true;
    if (config.booleanFalseValues.includes(value.trim())) return false;
    return undefined;
  }

  return undefined;
}

export function parseArrayEnvironmentVariable<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: unknown,
  config: Pick<EnvConfiguration<RuntimeEnvironment>, 'arraySeparator'>
): string[] | undefined {
  if (typeof value === 'string') {
    return value.split(config.arraySeparator);
  }

  if (Array.isArray(value)) {
    return value;
  }

  return undefined;
}

export function isEnumType<TEnum extends { [key: string]: string }>(
  enumType: TEnum,
  value: unknown
): value is TEnum[keyof TEnum] {
  if (typeof value !== 'string') return false;
  return Object.values(enumType).includes(value);
}

export function isNotNullish<T>(el: T | null | undefined): el is T {
  return el !== null && el !== undefined;
}
