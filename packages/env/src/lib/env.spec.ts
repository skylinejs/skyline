import { SkylineEnv } from './env';
import { EnvInputValidationError, EnvParsingError } from './env-error';

enum RuntimeEnvironment {
  DEV = 'DEV',
  CI = 'CI',
  PRD = 'PRD',
}

describe('SkylineEnv', () => {
  it('Validate runtime environment', () => {
    // Pass if runtime is not provided
    expect(() => new SkylineEnv<typeof RuntimeEnvironment>({})).not.toThrow();

    expect(
      () => new SkylineEnv({ runtimes: RuntimeEnvironment })
    ).not.toThrow();

    expect(
      () =>
        new SkylineEnv({
          runtime: undefined,
          runtimes: RuntimeEnvironment,
        })
    ).not.toThrow();

    // Pass if runtime is provided but no runtimes are provided
    expect(
      () => new SkylineEnv<typeof RuntimeEnvironment>({ runtime: 'stub' })
    ).not.toThrow();

    // Throw if runtime is empty string
    expect(
      () =>
        new SkylineEnv({
          runtime: '',
          runtimes: RuntimeEnvironment,
        })
    ).toThrowError(EnvInputValidationError);

    // Throw if runtime does not match any of the runtimes
    expect(
      () =>
        new SkylineEnv({
          runtime: RuntimeEnvironment.DEV.toLowerCase(),
          runtimes: RuntimeEnvironment,
        })
    ).toThrowError(EnvInputValidationError);
  });

  it('Parse boolean environment variable', () => {
    // Parse boolean environment variable
  });

  it('Parse string environment variable', () => {
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        SERVER_DATABASE_HOST: 'localhost',
      },
    });

    const env = {
      database: {
        host: envParser.parseString('SERVER_DATABASE_HOST', {
          DEV: '127.0.0.1',
          PRD: 'db.example.org',
        }),
        port: envParser.parseNumber('SERVER_DATABASE_PORT', {
          DEV: 5432,
          PRD: 5433,
        }),
      },
    };

    expect(env.database.host).toBe('localhost');
    expect(env.database.port).toBe(undefined);
  });

  it('Parse string environment variable', () => {
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.DEV,
      processEnv: {
        SERVER_DATABASE_HOST: 'localhost',
      },
    });

    const env = {
      database: {
        host: envParser.parseString('SERVER_DATABASE_HOST', {
          DEV: '127.0.0.1',
          PRD: 'db.example.org',
        }),
        port: envParser.parseNumber('SERVER_DATABASE_PORT', {
          DEV: 5432,
          PRD: 5433,
        }),
      },
    };

    expect(env.database.host).toBe('localhost');
    expect(env.database.port).toBe(5432);
  });

  it('Parse string environment variable', () => {
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.PRD,
      processEnv: {
        SERVER_DATABASE_HOST: 'localhost',
      },
    });

    const env = {
      database: {
        host: envParser.parseString('SERVER_DATABASE_HOST', {
          DEV: '127.0.0.1',
          PRD: 'db.example.org',
        }),
        port: envParser.parseNumber('SERVER_DATABASE_PORT', {
          DEV: 5432,
          PRD: 5433,
        }),
      },
    };

    expect(env.database.host).toBe('localhost');
    expect(env.database.port).toBe(5433);
  });

  it('Parse enum environment variable', () => {
    enum DatabaseDriver {
      POSTGRES = 'postgres',
      MYSQL = 'mysql',
    }

    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.DEV,
      processEnv: {
        SERVER_DATABASE_HOST: 'localhost',
      },
    });

    const env = {
      database: {
        host: envParser.parseString('SERVER_DATABASE_HOST', {
          DEV: '127.0.0.1',
          PRD: 'db.example.org',
        }),
        port: envParser.parseNumber('SERVER_DATABASE_PORT', {
          DEV: 5432,
          PRD: 5433,
        }),
        driver: envParser.parseEnum('SERVER_DATABASE_DRIVER', DatabaseDriver, {
          DEV: () => DatabaseDriver.POSTGRES,
        }),
      },
    };

    expect(env.database.host).toBe('localhost');
    expect(env.database.port).toBe(5432);
    expect(env.database.driver).toBe(DatabaseDriver.POSTGRES);
  });
});
