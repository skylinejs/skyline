import { TranslateConfiguration } from '../translate-configuration.interface';

export function substituteInterpolations({
  template,
  config,
}: {
  template: string;
  config: TranslateConfiguration;
}): string {
  const params = config.params ?? {};
  // If not parameters are provided, return the string
  if (!params) {
    return template;
  }

  // Substitute handlebars with parameters
  return template.replace(/\{\{([^}]+)\}\}/g, (_match) => {
    // Remove the wrapping curly braces, trim surrounding whitespace
    const match = _match.slice(2, -2).trim();

    // Get the value
    const val = params[match];

    // Replace
    if (val === undefined || val === null) {
      if (config.handleMissingParam === 'keep') {
        return _match;
      }
      if (config.handleMissingParam === 'remove') {
        return '';
      }
      throw new Error(`Missing parameter "${match}"`);
    }

    return `${val}`;
  });
}
