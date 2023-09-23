import { getRandomNumberGenerator } from './cache.utils';

describe('cache.utils', () => {
  it('getRandomNumberGenerator: Every call produces a number between 0 and 1', () => {
    {
      const random = getRandomNumberGenerator('seed-a');
      Array.from({ length: 1_000 }).forEach(() => {
        const rnd = random();
        expect(rnd).toBeGreaterThanOrEqual(0);
        expect(rnd).toBeLessThanOrEqual(1);
      });
    }
    {
      const random = getRandomNumberGenerator('seed-b');
      Array.from({ length: 1_000 }).forEach(() => {
        const rnd = random();
        expect(rnd).toBeGreaterThanOrEqual(0);
        expect(rnd).toBeLessThanOrEqual(1);
      });
    }
  });

  it('getRandomNumberGenerator: Differend seed procudes a different sequence of integers', () => {
    const random = getRandomNumberGenerator('seed-1');
    const numbers = Array.from({ length: 1_000 }).map(() => random());

    const random2 = getRandomNumberGenerator('seed-2');
    const numbers2 = Array.from({ length: 1_000 }).map(() => random2());

    numbers.forEach((n, i) => {
      expect(n).not.toEqual(numbers2[i]);
    });
  });

  it('getRandomNumberGenerator: Same seed produce the same sequence of integers', () => {
    const random = getRandomNumberGenerator('seed-1');
    const numbers = Array.from({ length: 1_000 }).map(() => random());

    const random2 = getRandomNumberGenerator('seed-1');
    const numbers2 = Array.from({ length: 1_000 }).map(() => random2());

    expect(numbers).toEqual(numbers2);
  });

  it('getRandomNumberGenerator: Random numbers should be evenly distributed', () => {
    {
      const random = getRandomNumberGenerator('seed-even-1');
      const numbers = Array.from({ length: 1_000 }).map(() => random());

      const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      expect(avg).toBeGreaterThanOrEqual(0.48);
      expect(avg).toBeLessThanOrEqual(0.52);

      const median = numbers.sort()[Math.floor(numbers.length / 2)];
      expect(median).toBeGreaterThanOrEqual(0.48);
      expect(median).toBeLessThanOrEqual(0.52);
    }

    {
      const random = getRandomNumberGenerator('seed-even-2');
      const numbers = Array.from({ length: 1_000 }).map(() => random());

      const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      expect(avg).toBeGreaterThanOrEqual(0.48);
      expect(avg).toBeLessThanOrEqual(0.52);

      const median = numbers.sort()[Math.floor(numbers.length / 2)];
      expect(median).toBeGreaterThanOrEqual(0.48);
      expect(median).toBeLessThanOrEqual(0.52);
    }
  });
});
