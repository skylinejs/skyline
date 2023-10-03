export class EnvParsingError extends Error {}

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
