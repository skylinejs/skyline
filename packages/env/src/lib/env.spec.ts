import { SkylineEnv } from './env';
import { EnvInputValidationError, EnvParsingError, EnvValidationError } from './env-error';

enum RuntimeEnvironment {
  DEV = 'DEV',
  CI = 'CI',
  PRD = 'PRD',
}

describe('SkylineEnv', () => {
  it('Validate runtime environment', () => {
    // Pass if runtime is not provided
    expect(() => new SkylineEnv<typeof RuntimeEnvironment>({})).not.toThrow();

    expect(() => new SkylineEnv({ runtimes: RuntimeEnvironment })).not.toThrow();

    expect(
      () =>
        new SkylineEnv({
          runtime: undefined,
          runtimes: RuntimeEnvironment,
        }),
    ).not.toThrow();

    // Pass if runtime is provided but no runtimes enum has been provided
    expect(() => new SkylineEnv<typeof RuntimeEnvironment>({ runtime: 'stub' })).not.toThrow();

    // Throw if runtime is empty string
    expect(
      () =>
        new SkylineEnv({
          runtime: '',
          runtimes: RuntimeEnvironment,
        }),
    ).toThrowError(EnvInputValidationError);

    // Throw if runtime does not match any of the runtimes
    expect(
      () =>
        new SkylineEnv({
          runtime: RuntimeEnvironment.DEV.toLowerCase(),
          runtimes: RuntimeEnvironment,
        }),
    ).toThrowError(EnvInputValidationError);
  });

  it('Parse boolean environment variable with default configuration', () => {
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
      true1: parser.parseBoolean('true1'),
      true2: parser.parseBoolean('true2'),
      true3: parser.parseBoolean('true3'),
      true4: parser.parseBoolean('true4'),
      true5: parser.parseBoolean('true5'),
      true6: parser.parseBoolean('true6'),
      true7: parser.parseBoolean('true7'),
      true8: parser.parseBoolean('true8'),
      true9: parser.parseBoolean('true9'),
      false1: parser.parseBoolean('false1'),
      false2: parser.parseBoolean('false2'),
      false3: parser.parseBoolean('false3'),
      false4: parser.parseBoolean('false4'),
      false5: parser.parseBoolean('false5'),
      false6: parser.parseBoolean('false6'),
      false7: parser.parseBoolean('false7'),
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

  it('Parse boolean environment variable with environment fallbacks', () => {
    // Parse boolean environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.DEV,
      processEnv: {
        true1: 'true',
        false1: 'false',
      },
    });

    const env = {
      true1: parser.parseBoolean('true1'),
      true2: parser.parseBoolean('true2'),
      true3: parser.parseBoolean('true3', { DEV: true }),
      true4: parser.parseBoolean('true4', { PRD: true }),
      true5: parser.parseBoolean('true5', { default: true }),
      true6: parser.parseBoolean('true6', { CI: true }),

      false1: parser.parseBoolean('false1'),
      false2: parser.parseBoolean('false2'),
      false3: parser.parseBoolean('false3', { DEV: false }),
      false4: parser.parseBoolean('false4', { PRD: false }),
      false5: parser.parseBoolean('false5', { default: false }),
      false6: parser.parseBoolean('false6', { CI: false }),
    };

    expect(env).toEqual({
      true1: true,
      true2: undefined,
      true3: true,
      true4: undefined,
      true5: true,
      true6: undefined,

      false1: false,
      false2: undefined,
      false3: false,
      false4: undefined,
      false5: false,
      false6: undefined,
    });
  });

  it('Parse boolean environment variable with parsing options', () => {
    // Parse boolean environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.DEV,
      booleanTrueValues: ['true', '1', 'yes', 'y', 'on', 'enabled', 'enable', 'do it'],
      processEnv: {
        true1: ' true  ',
        true2: Buffer.from('yes').toString('base64'),
        true3: Buffer.from('1').toString('hex'),
        true4: Buffer.from('on').toString('base64url'),
        true5: encodeURI('do it'),

        false1: '  false ',
      },
    });

    const env = {
      true1: parser.parseBoolean('true1', { valueTrim: true }),
      true2: parser.parseBoolean('true2', { valueEncoding: 'base64' }),
      true3: parser.parseBoolean('true3', { valueEncoding: 'hex' }),
      true4: parser.parseBoolean('true4', { valueEncoding: 'base64url' }),
      true5: parser.parseBoolean('true5', { valueEncoding: 'url' }),
      true6: parser.parseBoolean('true6', { valueEncoding: 'base64' }),

      false1: parser.parseBoolean('false1', { valueTrim: true }),
    };

    expect(env).toEqual({
      true1: true,
      true2: true,
      true3: true,
      true4: true,
      true5: true,
      true6: undefined,

      false1: false,
    });

    expect(() => parser.parseBoolean('true1')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true1')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true2')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true2')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true3')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true3')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true4')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true4')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true5')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true5')).toThrow('SkylineEnv.parseBoolean');
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
    expect(() => parser.parseBoolean('true3')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true4')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true4')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true5')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true5')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true6')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true6')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true7')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true7')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true8')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true8')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('true9')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('true9')).toThrow('SkylineEnv.parseBoolean');

    expect(parser.parseBoolean('true10')).toBe(true);
    expect(parser.parseBoolean('false1')).toBe(false);

    expect(() => parser.parseBoolean('false2')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false2')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('false3')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false3')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('false4')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false4')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('false5')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false5')).toThrow('SkylineEnv.parseBoolean');

    expect(() => parser.parseBoolean('false6')).toThrowError(EnvParsingError);
    expect(() => parser.parseBoolean('false6')).toThrow('SkylineEnv.parseBoolean');

    expect(parser.parseBoolean('false7')).toBe(false);
    expect(parser.parseBoolean('false8')).toBe(false);
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

    expect(() => parser.parseBooleanArray('fail1')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail2')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail3')).toThrowError(EnvParsingError);
  });

  it('Parse boolean array environment variable with validation constraints', () => {
    // Parse boolean array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: 'true',
        test2: 'true,1',
        test3: 'yes,false, yes',
      },
    });

    const env = {
      true1: parser.parseBooleanArray('test1', { arrayMinLength: 1 }),
      true2: parser.parseBooleanArray('test2', { arrayMaxLength: 2 }),
      true3: parser.parseBooleanArray('test3', { arrayUniqueItems: false }),
    };

    expect(env).toEqual({
      true1: [true],
      true2: [true, true],
      true3: [true, false, true],
    });

    expect(() => parser.parseBooleanArray('test1', { arrayMinLength: 2 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseBooleanArray('test1', { arrayMinLength: 2 })).toThrow('at least');

    expect(() => parser.parseBooleanArray('test2', { arrayMaxLength: 1 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseBooleanArray('test2', { arrayMaxLength: 1 })).toThrow('at most');

    expect(() => parser.parseBooleanArray('test3', { arrayUniqueItems: true })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseBooleanArray('test3', { arrayUniqueItems: true })).toThrow('unique');
  });

  it('Parse boolean array environment variable with custom configuration', () => {
    // Parse boolean array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: 'true',
        test2: 'true,1',
        test3: 'yes,false',
        test4: 'yes,false,1,0,0,0,1',

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
      test4: parser.parseBooleanArray('test4'),
    };

    expect(env).toEqual({
      test1: [true],
      test2: [true, true],
      test3: [true, false],
      test4: [true, false, true, false, false, false, true],
    });

    expect(() => parser.parseBooleanArray('fail1')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail2')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail3')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail4')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail5')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail6')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail7')).toThrowError(EnvParsingError);

    expect(() => parser.parseBooleanArray('fail8')).toThrowError(EnvParsingError);
  });

  it('Parse number environment variable with default configuration', () => {
    // Parse number environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: '1',
        test2: '0',
        test3: '-1',
        test4: '1.1',
        test5: '0.0',
        test6: '-1.1',
        test7: '5432',
        test8: '1000000',
        test9: '1000000.1',

        fail1: '1, 2',
        fail2: '[1]',
        fail3: '"1"',
        fail4: '1.1.1',
        fail5: '1,1',
      },
    });

    const env = {
      test1: parser.parseNumber('test1'),
      test2: parser.parseNumber('test2'),
      test3: parser.parseNumber('test3'),
      test4: parser.parseNumber('test4'),
      test5: parser.parseNumber('test5'),
      test6: parser.parseNumber('test6'),
      test7: parser.parseNumber('test7'),
      test8: parser.parseNumber('test8'),
      test9: parser.parseNumber('test9'),
      test10: parser.parseNumber('test10'),
    };

    expect(env).toEqual({
      test1: 1,
      test2: 0,
      test3: -1,
      test4: 1.1,
      test5: 0.0,
      test6: -1.1,
      test7: 5432,
      test8: 1000000,
      test9: 1000000.1,
      test10: undefined,
    });

    expect(() => parser.parseNumber('fail1')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumber('fail1')).toThrow('SkylineEnv.parseNumber');

    expect(() => parser.parseNumber('fail2')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumber('fail2')).toThrow('SkylineEnv.parseNumber');

    expect(() => parser.parseNumber('fail3')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumber('fail3')).toThrow('SkylineEnv.parseNumber');

    expect(() => parser.parseNumber('fail4')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumber('fail4')).toThrow('SkylineEnv.parseNumber');

    expect(() => parser.parseNumber('fail5')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumber('fail5')).toThrow('SkylineEnv.parseNumber');
  });

  it('Parse number environment variable with validation constraints', () => {
    // Parse number environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: '10',
        test2: '100',
        test3: '1.2',
        test4: '1000',
        test5: '10000',
      },
    });

    const env = {
      test1: parser.parseNumber('test1', { numberMinimum: 10 }),
      test2: parser.parseNumber('test2', { numberMaximum: 100 }),
      test3: parser.parseNumber('test3', { numberIsInteger: false }),
      test4: parser.parseNumber('test4', { numberExclusiveMinimum: 999 }),
      test5: parser.parseNumber('test5', { numberExclusiveMaximum: 10001 }),
    };

    expect(env).toEqual({
      test1: 10,
      test2: 100,
      test3: 1.2,
      test4: 1000,
      test5: 10000,
    });

    expect(() => parser.parseNumber('test1', { numberMinimum: 11 })).toThrow(EnvValidationError);
    expect(() => parser.parseNumber('test1', { numberMinimum: 11 })).toThrowError(
      'greater than or equal',
    );

    expect(() => parser.parseNumber('test2', { numberMaximum: 99 })).toThrow(EnvValidationError);
    expect(() => parser.parseNumber('test2', { numberMaximum: 99 })).toThrowError(
      'less than or equal',
    );

    expect(() => parser.parseNumber('test3', { numberIsInteger: true })).toThrow(
      EnvValidationError,
    );
    expect(() => parser.parseNumber('test3', { numberIsInteger: true })).toThrowError('integer');

    expect(() => parser.parseNumber('test4', { numberExclusiveMinimum: 1000 })).toThrow(
      EnvValidationError,
    );
    expect(() => parser.parseNumber('test4', { numberExclusiveMinimum: 1000 })).toThrowError(
      'greater than ',
    );

    expect(() => parser.parseNumber('test5', { numberExclusiveMaximum: 10000 })).toThrow(
      EnvValidationError,
    );
    expect(() => parser.parseNumber('test5', { numberExclusiveMaximum: 10000 })).toThrowError(
      'less than',
    );
  });

  it('Parse number array environment variable with default configuration', () => {
    // Parse number array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: '1',
        test2: '0',
        test3: '-1',
        test4: '1.1',
        test5: '0.0',
        test6: '-1.1',
        test7: '5432',
        test8: '1000000',
        test9: '1000000.1',
        test10: '1, 2',
        test11: '1,1',
        test12: '100, 200.5, 300,1.1,1.2',
        test13: '10e3,12e12',

        fail1: '[1]',
        fail2: '"1"',
        fail3: '1.1.1',
        fail4: 'Infinity',
        fail5: 'NaN',
        fail6: '100e1000',
      },
    });

    const env = {
      test1: parser.parseNumberArray('test1'),
      test2: parser.parseNumberArray('test2'),
      test3: parser.parseNumberArray('test3'),
      test4: parser.parseNumberArray('test4'),
      test5: parser.parseNumberArray('test5'),
      test6: parser.parseNumberArray('test6'),
      test7: parser.parseNumberArray('test7'),
      test8: parser.parseNumberArray('test8'),
      test9: parser.parseNumberArray('test9'),
      test10: parser.parseNumberArray('test10'),
      test11: parser.parseNumberArray('test11'),
      test12: parser.parseNumberArray('test12'),
      test13: parser.parseNumberArray('test13'),
      test14: parser.parseNumberArray('test14'),
    };

    expect(env).toEqual({
      test1: [1],
      test2: [0],
      test3: [-1],
      test4: [1.1],
      test5: [0.0],
      test6: [-1.1],
      test7: [5432],
      test8: [1000000],
      test9: [1000000.1],
      test10: [1, 2],
      test11: [1, 1],
      test12: [100, 200.5, 300, 1.1, 1.2],
      test13: [10000, 12000000000000],
      test14: undefined,
    });

    expect(() => parser.parseNumberArray('fail1')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail1')).toThrow('SkylineEnv.parseNumberArray');

    expect(() => parser.parseNumberArray('fail2')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail2')).toThrow('SkylineEnv.parseNumberArray');

    expect(() => parser.parseNumberArray('fail3')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail3')).toThrow('SkylineEnv.parseNumberArray');

    expect(() => parser.parseNumberArray('fail4')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail4')).toThrow('SkylineEnv.parseNumberArray');

    expect(() => parser.parseNumberArray('fail5')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail5')).toThrow('SkylineEnv.parseNumberArray');

    expect(() => parser.parseNumberArray('fail6')).toThrowError(EnvParsingError);
    expect(() => parser.parseNumberArray('fail6')).toThrow('SkylineEnv.parseNumberArray');
  });

  it('Parse number array environment variable with validation constraints', () => {
    // Parse number array environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: '10',
        test2: '100, 13',
        test3: '1.2, 1, 2, 1.2',
        test4: '5, 4, 3, 2, 1',
        test5: '10,11,12,13,14',
        test6: '1,2,3,1.2,5',
        test7: '10e3,12e12',
      },
    });

    const env = {
      test1: parser.parseNumberArray('test1', { arrayMinLength: 1 }),
      test2: parser.parseNumberArray('test2', { arrayMaxLength: 2 }),
      test3: parser.parseNumberArray('test3', { arrayUniqueItems: false }),
      test4: parser.parseNumberArray('test4', { numberMinimum: 1 }),
      test5: parser.parseNumberArray('test5', { numberMaximum: 14 }),
      test6: parser.parseNumberArray('test6', { numberIsInteger: false }),
      test7: parser.parseNumberArray('test7', {}),
    };

    expect(env).toEqual({
      test1: [10],
      test2: [100, 13],
      test3: [1.2, 1, 2, 1.2],
      test4: [5, 4, 3, 2, 1],
      test5: [10, 11, 12, 13, 14],
      test6: [1, 2, 3, 1.2, 5],
      test7: [10000, 12000000000000],
    });

    expect(() => parser.parseNumberArray('test1', { arrayMinLength: 2 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test1', { arrayMinLength: 2 })).toThrow('at least');

    expect(() => parser.parseNumberArray('test2', { arrayMaxLength: 1 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test2', { arrayMaxLength: 1 })).toThrow('at most');

    expect(() => parser.parseNumberArray('test3', { arrayUniqueItems: true })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test3', { arrayUniqueItems: true })).toThrow('unique');

    expect(() => parser.parseNumberArray('test4', { numberMinimum: 2 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test4', { numberMinimum: 2 })).toThrow(
      'greater than or equal',
    );

    expect(() => parser.parseNumberArray('test5', { numberMaximum: 13 })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test5', { numberMaximum: 13 })).toThrow(
      'less than or equal',
    );

    expect(() => parser.parseNumberArray('test6', { numberIsInteger: true })).toThrowError(
      EnvValidationError,
    );
    expect(() => parser.parseNumberArray('test6', { numberIsInteger: true })).toThrow('integer');
  });

  it('Parse string environment variable with default configuration', () => {
    // Parse string environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      processEnv: {
        test1: '',
        test2: ' ',
        test3: 'string',
        test4: ' string ',
        test5: '1',
        test6: 'true',
        test7: 'Infinity',
        test8: 'NaN',
        test9: '%20',
        test10: 'string1,string2',
      },
    });

    const env = {
      test1: parser.parseString('test1'),
      test2: parser.parseString('test2'),
      test3: parser.parseString('test3'),
      test4: parser.parseString('test4'),
      test5: parser.parseString('test5'),
      test6: parser.parseString('test6'),
      test7: parser.parseString('test7'),
      test8: parser.parseString('test8'),
      test9: parser.parseString('test9'),
      test10: parser.parseString('test10'),
    };

    expect(env).toEqual({
      test1: '',
      test2: ' ',
      test3: 'string',
      test4: ' string ',
      test5: '1',
      test6: 'true',
      test7: 'Infinity',
      test8: 'NaN',
      test9: '%20',
      test10: 'string1,string2',
    });
  });

  it('Parse string environment variable with environment defaults set', () => {
    // Parse string environment variable
    const parser = new SkylineEnv<typeof RuntimeEnvironment>({
      runtime: RuntimeEnvironment.DEV,
      processEnv: {},
    });

    const env = {
      test1: parser.parseString('test1', {
        default: 'test1default',
      }),

      test2: parser.parseString('test2', {
        default: undefined,
      }),

      test3: parser.parseString('test3', {}),
    };

    // TODO: Test default without runtime set

    expect(env).toEqual({
      test1: 'test1default',
      test2: undefined,
      test3: undefined,
    });
  });
});
