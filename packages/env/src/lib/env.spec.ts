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

    // Pass if runtime is provided but no runtimes enum has been provided
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

  it('Parse boolean environment variable with default configuration', () => {
    // Parse boolean environment variable
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        testTrue1: 'true',
        testTrue2: '1',
        testTrue3: 'yes',
        testTrue4: 'y',
        testTrue5: 'on',
        testTrue6: 'enabled',
        testTrue7: 'enable',
        testTrue8: 'ok',
        testTrue9: 'okay',
        testFalse1: '0',
        testFalse2: 'no',
        testFalse3: 'n',
        testFalse4: 'off',
        testFalse5: 'disabled',
        testFalse6: 'disable',
        testFalse7: 'false',
      },
    });

    const env = {
      testTrue1: envParser.parseBoolean('testTrue1'),
      testTrue2: envParser.parseBoolean('testTrue2'),
      testTrue3: envParser.parseBoolean('testTrue3'),
      testTrue4: envParser.parseBoolean('testTrue4'),
      testTrue5: envParser.parseBoolean('testTrue5'),
      testTrue6: envParser.parseBoolean('testTrue6'),
      testTrue7: envParser.parseBoolean('testTrue7'),
      testTrue8: envParser.parseBoolean('testTrue8'),
      testTrue9: envParser.parseBoolean('testTrue9'),
      testFalse1: envParser.parseBoolean('testFalse1'),
      testFalse2: envParser.parseBoolean('testFalse2'),
      testFalse3: envParser.parseBoolean('testFalse3'),
      testFalse4: envParser.parseBoolean('testFalse4'),
      testFalse5: envParser.parseBoolean('testFalse5'),
      testFalse6: envParser.parseBoolean('testFalse6'),
      testFalse7: envParser.parseBoolean('testFalse7'),
    };

    expect(env).toEqual({
      testTrue1: true,
      testTrue2: true,
      testTrue3: true,
      testTrue4: true,
      testTrue5: true,
      testTrue6: true,
      testTrue7: true,
      testTrue8: true,
      testTrue9: true,
      testFalse1: false,
      testFalse2: false,
      testFalse3: false,
      testFalse4: false,
      testFalse5: false,
      testFalse6: false,
      testFalse7: false,
    });
  });

  it('Parse boolean environment variable with custom configuration', () => {
    // Parse boolean environment variable
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        testTrue1: 'true',
        testTrue2: '1',
        testTrue3: 'yes',
        testTrue4: 'y',
        testTrue5: 'on',
        testTrue6: 'enabled',
        testTrue7: 'enable',
        testTrue8: 'ok',
        testTrue9: 'okay',
        testTrue10: '+',
        testFalse1: '0',
        testFalse2: 'no',
        testFalse3: 'n',
        testFalse4: 'off',
        testFalse5: 'disabled',
        testFalse6: 'disable',
        testFalse7: 'false',
        testFalse8: '-',
      },
      booleanFalseValues: ['false', '-', '0'],
      booleanTrueValues: ['true', '+', '1'],
    });

    const env = {
      testTrue1: envParser.parseBoolean('testTrue1'),
      testTrue2: envParser.parseBoolean('testTrue2'),
      testTrue3: envParser.parseBoolean('testTrue3'),
      testTrue4: envParser.parseBoolean('testTrue4'),
      testTrue5: envParser.parseBoolean('testTrue5'),
      testTrue6: envParser.parseBoolean('testTrue6'),
      testTrue7: envParser.parseBoolean('testTrue7'),
      testTrue8: envParser.parseBoolean('testTrue8'),
      testTrue9: envParser.parseBoolean('testTrue9'),
      testFalse1: envParser.parseBoolean('testFalse1'),
      testFalse2: envParser.parseBoolean('testFalse2'),
      testFalse3: envParser.parseBoolean('testFalse3'),
      testFalse4: envParser.parseBoolean('testFalse4'),
      testFalse5: envParser.parseBoolean('testFalse5'),
      testFalse6: envParser.parseBoolean('testFalse6'),
      testFalse7: envParser.parseBoolean('testFalse7'),
    };
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
