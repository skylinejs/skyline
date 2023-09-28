import { UserValobj } from './user.interface';

export function isUserRowsOrThrow(
  candidates: unknown[]
): asserts candidates is UserValobj[] {
  if (!Array.isArray(candidates)) {
    throw new Error(`Expected array, got ${typeof candidates}`);
  }

  for (const candidate of candidates) {
    if (typeof candidate !== 'object' || candidate === null) {
      throw new Error(`Expected object, got ${typeof candidate}`);
    }

    if (typeof (candidate as UserValobj).id !== 'number') {
      throw new Error(
        `Expected number, got ${typeof (candidate as UserValobj).id}`
      );
    }

    if (typeof (candidate as UserValobj).name !== 'string') {
      throw new Error(
        `Expected string, got ${typeof (candidate as UserValobj).name}`
      );
    }
  }
}

export function isUserRowOrThrow(
  candidate: unknown
): asserts candidate is UserValobj {
  isUserRowsOrThrow([candidate]);
}
