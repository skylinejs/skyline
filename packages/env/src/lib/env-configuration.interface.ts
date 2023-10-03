import { ValueEncodingType } from './env.interface';

export interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  // Runtime environment

  /** The runtime of your application */
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;

  /** The possible runtimes of your application.\
   * Provide this option if you want to validate that the runtime is one of the provided runtimes.
   */
  runtimes?: RuntimeEnvironment;

  /** The process environment. Provide this option if you want to use a custom process environment.\
   * @default process.env
   */
  processEnv: NodeJS.ProcessEnv;

  // Variable name
  /**
   * The prefix of your environment variables.\
   * Provide this option if you want to validate that the environment variable name starts with the provided prefix.
   */
  variableNamePrefix: string;

  /**
   * Whether to ignore the casing of your environment variable names.\
   * @default false
   */
  variableNameIgnoreCasing: boolean;

  // Variable value
  valueTrim: boolean;
  valueEncoding?: ValueEncodingType;
  valueRemoveAfterParse: boolean;

  // Boolean parsing
  booleanTrueValues: string[];
  booleanFalseValues: string[];

  // String parsing
  stringMinLength?: number;
  stringMaxLength?: number;
  stringPattern?: RegExp | string;

  // Number parsing
  numberMinimum?: number;
  numberMaximum?: number;
  numberExclusiveMinimum?: number;
  numberExclusiveMaximum?: number;

  // JSON parsing
  jsonMinProperties?: number;
  jsonMaxProperties?: number;
  jsonRequired?: string[];

  // Array parsing
  arraySeparator: string;
  arrayMinLength?: number;
  arrayMaxLength?: number;
  arrayUniqueItems?: boolean;
}
