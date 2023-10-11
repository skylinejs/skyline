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

    interpolation = new RegExp(
      `${prefixEscaped}([^${prefixEscaped}${suffixEscaped}]+)${suffixEscaped}`,
      'g',
    );
  } else {
    interpolation = config.interpolation as RegExp;
  }

  // Substitute handlebars with parameters
  return template.replace(interpolation, (match, firstMatchingGroup) => {
    const key = (firstMatchingGroup ?? '').trim();

    // Get the value
    let obj: any = params;
    const fragments = key.split(config.paramSeparator);
    for (const fragment of fragments) {
      if (typeof obj !== 'object') {
        break;
      }
      obj = obj[fragment];
    }

    const val = obj;

    // Replace
    if (val === undefined || val === null) {
      if (config.handleMissingParam === 'keep') {
        return match;
      }
      if (config.handleMissingParam === 'remove') {
        return '';
      }
      throw new Error(`Missing parameter "${match}"`);
    }

    return `${val}`;
  });
}
