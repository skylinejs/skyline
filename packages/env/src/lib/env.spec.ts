import { SkylineEnv } from './env';

enum RuntimeEnvironment {
  DEV = 'dev',
  PRD = 'prd',
}

describe('SkylineEnv', () => {
  it('should work', () => {
    const envParser = new SkylineEnv<typeof RuntimeEnvironment>();
    const test = envParser.parseString('yes', {
      DEV: 'yes',
      PRD: 'no',
    });
  });
});
