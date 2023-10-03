import { ValueEncodingType } from './env.interface';

export interface EnvConfigurationInput<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  // Runtime environment
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;
  runtimes?: RuntimeEnvironment;
  processEnv?: NodeJS.ProcessEnv;

  // Variable name
  variableNamePrefix?: string;
  variableNameIgnoreCasing?: boolean;

  // Variable value
  valueTrim?: boolean;
  valueEncoding?: ValueEncodingType;
  valueRemoveAfterParse?: boolean;

  // Boolean parsing
  booleanTrueValues?: string[];
  booleanFalseValues?: string[];

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
  arraySeparator?: string;
  arrayMinLength?: number;
  arrayMaxLength?: number;
  arrayUniqueItems?: boolean;
}

export interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  // Runtime environment
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment];
  runtimes?: RuntimeEnvironment;
  processEnv: NodeJS.ProcessEnv;

  // Variable name
  variableNamePrefix: string;
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
