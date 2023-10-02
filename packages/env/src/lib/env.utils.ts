import { EnvConfiguration } from './env-configuration.interface';

export function parseEnvironmentVariable<
  RuntimeEnvironment extends { [key: string]: string }
>(
  variableName: string,
  config: EnvConfiguration<RuntimeEnvironment> = {}
): string | undefined {
  if (config.prefix && !variableName.startsWith(config.prefix.toLowerCase())) {
    throw new Error(
      `Cannot obtain environment variable "${variableName}": has to start with "${config.prefix}"`
    );
  }

  const processEnv = config.processEnv ?? process.env ?? {};
  console.log({ processEnv, variableName });
  const value = processEnv[variableName];
  return value;
}
