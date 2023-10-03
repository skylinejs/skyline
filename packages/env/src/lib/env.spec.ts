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
        true1: 'true',
        true2: '1',
        true3: 'yes',
        true4: 'y',
        true5: 'on',
        true6: 'enabled',
        true7: 'enable',
        true8: 'ok',
        true9: 'okay',
        false1: '0',
        false2: 'no',
        false3: 'n',
        false4: 'off',
        false5: 'disabled',
        false6: 'disable',
        false7: 'false',
      },
    });

    const env = {
      true1: envParser.parseBoolean('true1'),
      true2: envParser.parseBoolean('true2'),
      true3: envParser.parseBoolean('true3'),
      true4: envParser.parseBoolean('true4'),
      true5: envParser.parseBoolean('true5'),
      true6: envParser.parseBoolean('true6'),
      true7: envParser.parseBoolean('true7'),
      true8: envParser.parseBoolean('true8'),
      true9: envParser.parseBoolean('true9'),
      false1: envParser.parseBoolean('false1'),
      false2: envParser.parseBoolean('false2'),
      false3: envParser.parseBoolean('false3'),
      false4: envParser.parseBoolean('false4'),
      false5: envParser.parseBoolean('false5'),
      false6: envParser.parseBoolean('false6'),
      false7: envParser.parseBoolean('false7'),
    };

    expect(env).toEqual({
      true1: true,
      true2: true,
      true3: true,
      true4: true,
      true5: true,
      true6: true,
      true7: true,
      true8: true,
      true9: true,
      false1: false,
      false2: false,
      false3: false,
      false4: false,
      false5: false,
      false6: false,
      false7: false,
    });
  });

  it('Parse boolean environment variable with custom configuration', () => {
    // Parse boolean environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        true1: 'true',
        true2: '1',
        true3: 'yes',
        true4: 'y',
        true5: 'on',
        true6: 'enabled',
        true7: 'enable',
        true8: 'ok',
        true9: 'okay',
        true10: '+',
        false1: '0',
        false2: 'no',
        false3: 'n',
        false4: 'off',
        false5: 'disabled',
        false6: 'disable',
        false7: 'false',
        false8: '-',
      },
      booleanFalseValues: ['false', '-', '0'],
      booleanTrueValues: ['true', '+', '1'],
    });
    expect(parser.parseBoolean('true1')).toBe(true);
    expect(parser.parseBoolean('true2')).toBe(true);
    expect(() => parser.parseBoolean('true3')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true4')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true5')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true6')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true7')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true8')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true9')).toThrowError(EnvParsingError);
    expect(parser.parseBoolean('true10')).toBe(true);
    expect(parser.parseBoolean('false1')).toBe(false);
    expect(() => parser.parseBoolean('false2')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false3')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false4')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false5')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false6')).toThrowError(EnvParsingError);
    expect(parser.parseBoolean('false7')).toBe(false);
    expect(parser.parseBoolean('false8')).toBe(false);
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

  it('Parse boolean array environment variable with default configuration', () => {
    // Parse boolean array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: 'true',
        test2: 'true,1',
        test3: 'yes,false',
        test4: 'y, 0',
        test5: 'on, no',
        test6: 'enabled, n',
        test7: 'enable, off',
        test8: '1, 0,1,1, 0, yes , no ',

        fail1: '1, 2',
        fail2: '[1]',
        fail3: '"true"',
      },
    });

    const env = {
      true1: parser.parseBooleanArray('test1'),
      true2: parser.parseBooleanArray('test2'),
      true3: parser.parseBooleanArray('test3'),
      true4: parser.parseBooleanArray('test4'),
      true5: parser.parseBooleanArray('test5'),
      true6: parser.parseBooleanArray('test6'),
      true7: parser.parseBooleanArray('test7'),
      true8: parser.parseBooleanArray('test8'),
      true9: parser.parseBooleanArray('test9'),
    };

    expect(env).toEqual({
      true1: [true],
      true2: [true, true],
      true3: [true, false],
      true4: [true, false],
      true5: [true, false],
      true6: [true, false],
      true7: [true, false],
      true8: [true, false, true, true, false, true, false],
    });

    expect(() => parser.parseBooleanArray('fail1')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail2')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail3')).toThrowError(
      EnvParsingError
    );
  });

  it('Parse boolean array environment variable with custom configuration', () => {
    // Parse boolean array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: 'true',
        test2: 'true,1',
        test3: 'yes,false',

        fail1: 'y, 0',
        fail2: 'on, no',
        fail3: 'enabled, n',
        fail4: 'enable, off',
        fail5: '1, 0,1,1, 0, yes , no ',
        fail6: '1, 2',
        fail7: '[1]',
        fail8: '"true"',
      },
      booleanFalseValues: ['false', '-', '0'],
      booleanTrueValues: ['yes', 'true', '+', '1'],
    });

    const env = {
      test1: parser.parseBooleanArray('test1'),
      test2: parser.parseBooleanArray('test2'),
      test3: parser.parseBooleanArray('test3'),
    };

    expect(env).toEqual({
      test1: [true],
      test2: [true, true],
      test3: [true, false],
    });

    expect(() => parser.parseBooleanArray('fail1')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail2')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail3')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail4')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail5')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail6')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail7')).toThrowError(
      EnvParsingError
    );

    expect(() => parser.parseBooleanArray('fail8')).toThrowError(
      EnvParsingError
    );
  });

  /** === */

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
