export interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string }
> {
  runtime?: keyof RuntimeEnvironment;
  prefix?: string;
  dotenv?: string;
  processEnv?: NodeJS.ProcessEnv;
  removeAfterParse?: boolean;
}
