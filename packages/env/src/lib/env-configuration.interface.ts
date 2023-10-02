export interface EnvConfiguration {
  prefix?: string;
  dotenv?: string;
  processEnv?: NodeJS.ProcessEnv;
  removeAfterParse?: boolean;
}
