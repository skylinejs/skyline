import { SkylineEnv } from './env';

enum RuntimeEnvironment {
  DEV = 'DEV',
  CI = 'CI',
  PRD = 'PRD',
}

describe('SkylineEnv', () => {
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
