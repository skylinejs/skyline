import { TranslateConfiguration } from '../translate-configuration.interface';

export function substituteInterpolations({
  template,
  config,
}: {
  template: string | undefined;
  config: TranslateConfiguration;
}): string | undefined {
  const params = config.params ?? {};
  // If not parameters are provided, return the string
  if (!params || !template) {
    return template;
  }

  // Get the interpolation pattern
  let interpolation: RegExp;
  if ((config.interpolation as any).prefix) {
    const { prefix, suffix } = config.interpolation as { prefix: string; suffix: string };
    const prefixEscaped = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const suffixEscaped = suffix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    interpolation = new RegExp(`${prefixEscaped}([^${suffixEscaped}]+)${suffixEscaped}`, 'g');
  } else {
    interpolation = config.interpolation as RegExp;
  }

  // Substitute handlebars with parameters
  return template.replace(interpolation, (_match) => {
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
