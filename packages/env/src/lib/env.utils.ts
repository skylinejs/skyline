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

export function parseNumberValue(value: unknown): number | undefined {
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

export function validateNumberValue<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: number | undefined,
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    | 'numberMinimum'
    | 'numberMaximum'
    | 'numberIsInteger'
    | 'numberExclusiveMinimum'
    | 'numberExclusiveMaximum'
  >
): true | string {
  if (value === undefined) return true;

  // Number minimum
  if (config.numberMinimum !== undefined && value < config.numberMinimum) {
    return `Value must be greater than or equal to "${config.numberMinimum}".`;
  }

  // Number maximum
  if (config.numberMaximum !== undefined && value > config.numberMaximum) {
    return `Value must be less than or equal to "${config.numberMaximum}".`;
  }

  // Number is integer
  if (config.numberIsInteger && !Number.isInteger(value)) {
    return `Value must be an integer.`;
  }

  // Number exclusive minimum
  if (
    config.numberExclusiveMinimum !== undefined &&
    value <= config.numberExclusiveMinimum
  ) {
    return `Value must be greater than "${config.numberExclusiveMinimum}".`;
  }

  // Number exclusive maximum
  if (
    config.numberExclusiveMaximum !== undefined &&
    value >= config.numberExclusiveMaximum
  ) {
    return `Value must be less than "${config.numberExclusiveMaximum}".`;
  }

  return true;
}

export function validateStringValue<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: string | undefined,
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    'stringMinLength' | 'stringMaxLength' | 'stringPattern'
  >
): true | string {
  if (value === undefined) return true;

  // String min length
  if (
    config.stringMinLength !== undefined &&
    value.length < config.stringMinLength
  ) {
    return `String must have at least ${config.stringMinLength} characters.`;
  }

  // String max length
  if (
    config.stringMaxLength !== undefined &&
    value.length > config.stringMaxLength
  ) {
    return `String must have at most ${config.stringMaxLength} characters.`;
  }

  // String pattern
  if (config.stringPattern !== undefined) {
    const pattern = new RegExp(config.stringPattern);
    if (!pattern.test(value)) {
      return `String must match pattern "${config.stringPattern}".`;
    }
  }

  return true;
}

export function parseEnumValue<
  TEnum extends { [key: string]: string },
  RuntimeEnvironment extends { [key: string]: string }
>(
  enumType: TEnum,
  value: unknown,
  config: Pick<EnvConfiguration<RuntimeEnvironment>, 'enumIgnoreCasing'>
): TEnum[keyof TEnum] | undefined {
  if (typeof value !== 'string') return undefined;

  const enumValue = Object.values(enumType).find((enumValue) => {
    if (config.enumIgnoreCasing) {
      return enumValue.toLowerCase() === value.toLowerCase();
    } else {
      return enumValue === value;
    }
  });

  return enumValue as TEnum[keyof TEnum] | undefined;
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

export function validateArrayValue<
  RuntimeEnvironment extends { [key: string]: string }
>(
  value: string[] | undefined,
  config: Pick<
    EnvConfiguration<RuntimeEnvironment>,
    'arrayMinLength' | 'arrayMaxLength' | 'arrayUniqueItems'
  >
): true | string {
  if (value === undefined) return true;

  // Array min length
  if (
    config.arrayMinLength !== undefined &&
    value.length < config.arrayMinLength
  ) {
    return `Array must have at least ${config.arrayMinLength} items.`;
  }

  // Array max length
  if (
    config.arrayMaxLength !== undefined &&
    value.length > config.arrayMaxLength
  ) {
    return `Array must have at most ${config.arrayMaxLength} items.`;
  }

  // Array unique items
  if (config.arrayUniqueItems && new Set(value).size !== value.length) {
    return `Array must have unique items.`;
  }

  return true;
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
