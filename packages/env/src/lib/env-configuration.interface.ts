import { ValueEncodingType } from './env.interface';

export interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  // ===  Runtime environment ===
  /** The runtime of your application */
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;

  /** The possible runtimes of your application.\
   * Provide this option if you want to validate that the runtime is one of the provided runtimes.
   */
  runtimes?: RuntimeEnvironment;

  /** The process environment (probably only useful for testing).\
   * Provide this option if you want to use a custom process environment.
   * @default process.env
   */
  processEnv: NodeJS.ProcessEnv;

  // ===  Variable name ===
  /**
   * The prefix of your environment variables.\
   * Provide this option if you want to validate that the environment variable name starts with the provided prefix.
   */
  variableNamePrefix: string;

  /**
   * Whether to ignore the casing of your environment variable names.
   * @default false
   */
  variableNameIgnoreCasing: boolean;

  // ===  Variable value ===
  /**
   * Whether to trim the value of your environment variables.
   * @default false
   */
  valueTrim: boolean;

  /**
   * The encoding of your environment variables.\
   * Provide this option if you want to decode the value of your environment variables.\
   * Possible values are 'base64', 'base64url', 'hex' and 'url'.\
   */
  valueEncoding?: ValueEncodingType;

  /**
   * Whether to remove the value of your environment variables after parsing.\
   * Provide this option if you want to remove the value of your environment variables after parsing.\
   * This can improve the security of your application.
   * @default false
   */
  valueRemoveAfterParse: boolean;

  // === Boolean parsing ===
  /**
   * The values (strings) that are considered as true.
   * @default true, 1, yes, y, on, enabled, enable, ok, okay
   */
  booleanTrueValues: string[];

  /**
   * The values (strings) that are considered as false.
   * @default false, 0, no, n, off, disabled, disable
   */
  booleanFalseValues: string[];

  // === String parsing ===
  /**
   * The minimum length of the string.
   */
  stringMinLength?: number;

  /**
   * The maximum length of the string.
   */
  stringMaxLength?: number;

  /**
   * The pattern of the string.
   */
  stringPattern?: RegExp | string;

  // === Enum parsing ===
  /**
   * Whether to ignore the casing of the enum values.
   */
  enumIgnoreCasing: boolean;

  // === Number parsing ===
  /**
   * The minimum value of the number.
   */
  numberMinimum?: number;

  /**
   * The maximum value of the number.
   */
  numberMaximum?: number;

  /**
   * Whether the number must be an integer.
   */
  numberIsInteger: boolean;

  /**
   * The minimum value of the number (exclusive).
   */
  numberExclusiveMinimum?: number;

  /**
   * The maximum value of the number (exclusive).
   */
  numberExclusiveMaximum?: number;

  // === JSON parsing ===
  /**
   * The minimum number of properties of the JSON object.
   */
  jsonMinProperties?: number;

  /**
   * The maximum number of properties of the JSON object.
   */
  jsonMaxProperties?: number;

  /**
   * The required properties of the JSON object.
   */
  jsonRequired?: string[];

  // === Array parsing ===
  /**
   * The separator of the array.
   * @default ,
   */
  arraySeparator: string;

  /**
   * The minimum length of the array.
   */
  arrayMinLength?: number;

  /**
   * The maximum length of the array.
   */
  arrayMaxLength?: number;

  /**
   * Whether to ensure that the array has unique items.
   * @default false
   */
  arrayUniqueItems: boolean;
}
