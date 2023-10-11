/**
 * Assigns the properties of object2 to object1, but only if they are not undefined
 * @param target Object to assign to
 * @param source Object to assign from
 * @returns The modified target object with the assigned properties
 */
export function assignPartialObject<T extends object>(
  target: T,
  source: Partial<T> | undefined | null,
): T {
  const result: T = { ...target };

  if (!source || typeof source !== 'object') {
    return result;
  }

  Object.keys(source).forEach((_key) => {
    const key = _key as keyof T;
    const value = source[key];
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
}
