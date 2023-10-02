export interface EnvConfiguration<T> {
  environments: T;
  dotenv?: string;
  removeAfterParse?: boolean;
}
