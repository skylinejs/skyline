import { EnvConfiguration } from './env-configuration.interface';
import { EnvParsingError } from './env-error';

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
    | 'processEnv'
    | 'variableNamePrefix'
    | 'variableNameIgnoreCasing'
    | 'valueTrim'
    | 'valueEncoding'
    | 'valueRemoveAfterParse'
  >
): string | undefined {
  // Variable name prefix
  const variableNamePrefix = config.variableNamePrefix;
  if (variableNamePrefix && !variableName.startsWith(variableNamePrefix)) {
    throw new EnvParsingError(
      `Cannot obtain environment variable "${variableName}": has to start with "${variableNamePrefix}"`,
      {
        variableName,
        value: variableNamePrefix,
      }
    );
  }

  // Get environment variable value
  let value: string | undefined = undefined;
  if (config.variableNameIgnoreCasing) {
    value = Object.entries(config.processEnv).find(
      ([key]) => key.toLowerCase() === variableName.toLowerCase()
    )?.[1];
  } else {
    value = config.processEnv[variableName];
  }

  // Trim value
  if (value && config.valueTrim) {
    value = value.trim();
  }

  // Encoding
  if (value && config.valueEncoding) {
    switch (config.valueEncoding) {
      case 'base64':
        value = Buffer.from(value, 'base64').toString();
        break;
      case 'base64url':
        value = Buffer.from(value, 'base64url').toString();
        break;
      case 'hex':
        value = Buffer.from(value, 'hex').toString();
        break;
      case 'url':
        value = decodeURIComponent(value);
        break;
    }
  }

  // Remove after parse
  if (value && config.valueRemoveAfterParse) {
    delete config.processEnv[variableName];
  }

  return value;
}

/**
 * Parses a value to a boolean.
 * @param value The value to parse.
 * @param config The parsing configuration to use.
 * @returns The parsed boolean value, or undefined if the value could not be parsed.
 */
export function parseBooleanValue<
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
    if (config.booleanTrueValues.includes(value)) return true;
    if (config.booleanFalseValues.includes(value)) return false;
    return undefined;
  }

  return undefined;
}

export function parseNumberValue<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: unknown,
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    | 'numberMinimum'
    | 'numberMaximum'
    | 'numberExclusiveMinimum'
    | 'numberExclusiveMaximum'
  >
): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);
    if (isNaN(parsedValue) || !isFinite(parsedValue)) {
      return undefined;
    }
    return parsedValue;
  }

  return undefined;
}

/**
 * Parses a value to an array of strings.
 * @param value The value to parse.
 * @param config The parsing configuration to use.
 * @returns The parsed array of strings, or undefined if the value could not be parsed.
 */
export function parseArrayValue<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: unknown,
  config: Pick<EnvConfiguration<RuntimeEnvironment>, 'arraySeparator'>
): string[] | undefined {
  if (typeof value === 'string') {
    return value.split(config.arraySeparator).map((value) => value.trim());
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

export function assignOptions<T extends object>(config: T, options: any): T {
  const result: any = { ...config };

  if (!options || typeof options !== 'object') {
    return result;
  }

  Object.keys(options).forEach((key) => {
    const value = options[key];
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}
