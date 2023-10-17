export type FlagOptions = {
  char?: string;
};

export type BooleanFlagOptions = FlagOptions & {
  type: 'boolean';
};

export type BooleanFlag<T> = FlagOptions & BooleanFlagOptions;

export const Flags = {
  boolean<T = boolean>(options: Partial<BooleanFlag<T>> = {}): BooleanFlag<T> {
    return {
      ...options,
      type: 'boolean',
    };
  },
};
