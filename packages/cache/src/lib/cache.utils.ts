export function isNotNullish<T>(el: T | null | undefined): el is T {
  return el !== null && el !== undefined;
}

export function isNullish<T>(value?: T | null | undefined): value is null | undefined {
  return value == null || value === undefined;
}

export function extractMessageFromError(error: unknown): string | undefined {
  try {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean') {
      return `${error}`;
    }

    if (typeof error === 'object') {
      if ((error as any)?.message) {
        return (error as any).message;
      }

      return JSON.stringify(error);
    }
  } catch (err: any) {}

  return undefined;
}

export function extractStackFromError(error: unknown): string | undefined {
  try {
    if (error instanceof Error) {
      return error.stack;
    }

    if (typeof error === 'object') {
      if (typeof (error as any)?.stack === 'string') {
        return (error as any)?.stack;
      }
    }
  } catch (err: any) {}
  return undefined;
}

/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-bitwise */
/**
 * Get a seed for a random number generator based on a string
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * @param str
 * @returns
 */
function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  (h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1);
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * Get a random number generator based on a seed
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * @param seed
 * @returns
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get a random number generator based on a seed string
 * @param seed The seed string
 * @returns A random number generator that produces a number between 0 and 1
 */
export function getRandomNumberGenerator(seed: string = ''): () => number {
  return mulberry32(cyrb128(seed)[0]);
}
