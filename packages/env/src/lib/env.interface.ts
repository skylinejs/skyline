export interface ParsingOptions {
  // Variable name
  variableNamePrefix?: boolean;
  variableNameIgnoreCasing?: boolean;

  // Variable value
  removeAfterParse?: boolean;
  valueTrim?: boolean;
}

export interface BooleanParsingptions extends ParsingOptions {
  booleanTrueValues?: string[];
  booleanFalseValues?: string[];
}

export interface StringParsingOptions extends ParsingOptions {
  stringMinLength?: number;
  stringMaxLength?: number;
  stringPattern?: RegExp | string;
}

export interface NumberParsingOptions extends ParsingOptions {
  numberMinimum?: number;
  numberMaximum?: number;
  numberExclusiveMinimum?: number;
  numberExclusiveMaximum?: number;
}

export interface JsonParsingOptions extends ParsingOptions {
  jsonMinProperties?: number;
  jsonMaxProperties?: number;
  jsonRequired?: string[];
}

export interface ArrayParsingOptions extends ParsingOptions {
  arraySeparator?: string;
  arrayMinLength?: number;
  arrayMaxLength?: number;
  arrayUniqueItems?: boolean;
}
