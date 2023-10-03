export interface EnvConfigurationInput<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;
  runtimes?: RuntimeEnvironment;

  processEnv?: NodeJS.ProcessEnv;
  prefix?: string;
  dotenv?: string;
  removeAfterParse?: boolean;

  // Array parsing
  arraySeparator?: string;

  // Boolean parsing
  booleanTrueValues?: string[];
  booleanFalseValues?: string[];
}

export interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment];
  runtimes?: RuntimeEnvironment;

  processEnv: NodeJS.ProcessEnv;
  prefix: string;
  dotenv?: string;
  removeAfterParse?: boolean;

  // Array parsing
  arraySeparator: string;

  // Boolean parsing
  booleanTrueValues: string[];
  booleanFalseValues: string[];
}
