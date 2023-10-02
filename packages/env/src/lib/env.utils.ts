import { EnvConfiguration } from './env-configuration.interface';

export function parseEnvironmentVariable(
  variableName: string,
  config: EnvConfiguration = {}
): string | undefined {
  const _key = variableName.trim().toLowerCase();

  if (config.prefix && !_key.startsWith(config.prefix.toLowerCase())) {
    throw new Error(
      `Cannot obtain environment variable "${variableName}": has to start with "${config.prefix}"`
    );
  }

  const processEnv = config.processEnv ?? process.env ?? {};
  const value = processEnv[_key];
  return value;
}
