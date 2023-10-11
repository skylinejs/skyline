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
  return template.replace(/\{\{([^}]+)\}\}/g, (match) => {
    // Remove the wrapping curly braces, trim surrounding whitespace
    match = match.slice(2, -2).trim();

    // Get the value
    const val = params[match];

    // Replace
    if (val === undefined || val === null) {
      return '';
    }

    return `${val}`;
  });
}
