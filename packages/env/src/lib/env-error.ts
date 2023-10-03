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
