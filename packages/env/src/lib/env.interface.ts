export interface BooleanParsingptions {}

export interface StringParsingOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;
}

export interface NumberParsingOptions {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
}

export interface ArrayParsingOptions {
  minLength?: number;
  maxLength?: number;
  uniqueItems?: boolean;
}

export interface JsonParsingOptions {
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
}
