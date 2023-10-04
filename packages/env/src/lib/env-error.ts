/**
 * Parsing error thrown when a value cannot be parsed from an environment variable.
 */
export class EnvParsingError extends Error {
  readonly variableName: string;
  readonly value: unknown;

  constructor(
    message: string,
    context: {
      variableName: string;
      value: unknown;
    }
  ) {
    super(message);
    this.variableName = context.variableName;
    this.value = context.value;
  }
}

/**
 * Validation error thrown when an environment variable value does not fulfill the validation criteria.
 */
export class EnvValidationError extends Error {
  readonly variableName: string;
  readonly value: unknown;

  constructor(
    message: string,
    context: {
      variableName: string;
      value: unknown;
    }
  ) {
    super(message);
    this.variableName = context.variableName;
    this.value = context.value;
  }
}

/**
 * Validation error thrown when an invalid input is provided to the method.
 */
export class EnvInputValidationError extends Error {
  readonly parameter: string;
  readonly value: unknown;

  constructor(
    message: string,
    context: {
      parameter: string;
      value: unknown;
    }
  ) {
    super(message);
    this.parameter = context.parameter;
    this.value = context.value;
  }
}
