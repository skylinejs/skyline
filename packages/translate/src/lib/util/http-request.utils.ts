/**
 * Parse HTTP header "Accept-Language" to get the languages accepted by the client.
 * @param headers The HTTP request's headers object or the "Accept-Language" header value
 * @returns The languages accepted by the client, sorted by q value (highest q value first)
 */
export function parseHttpHeaderAcceptLanguages(
  headers?: { [key: string]: string | string[] } | string | string[] | null | undefined,
): string[] {
  // Get header value from input
  let header = '';

  if (headers && typeof headers === 'string') {
    header = headers;
  }

  if (headers && Array.isArray(headers)) {
    header = headers.join(',');
  }

  if (headers && typeof headers === 'object') {
    // Get header case-insensitive
    Object.keys(headers).forEach((key) => {
      if (key?.trim()?.toLowerCase() === 'accept-language') {
        header = (headers as any)[key];
      }
    });

    if (Array.isArray(header)) {
      header = header.join(',');
    }
  }

  if (!header || typeof header !== 'string') {
    return [];
  }

  // Parse header value languages
  let languages: { language: string; q?: number }[] = [];

  const parts = header.split(',');
  for (const part of parts) {
    const [language, q] = part.split(';q=').map((p) => p.trim());

    if (language && !(q !== undefined && q === '0')) {
      languages.push({ language, q: q ? parseFloat(q) : undefined });
    }
  }

  languages = languages
    // Sort languages by q value
    .sort(({ q: q1 }, { q: q2 }) => {
      if (q1 === q2) return 0;
      if (q1 === undefined) return -1;
      if (q2 === undefined) return 1;
      return q2 - q1;
    })
    // Remove duplciates (take highest q value)
    .filter(
      ({ language }, index) => languages.findIndex((l2) => l2.language === language) === index,
    );

  return languages.map((l) => l.language);
}
