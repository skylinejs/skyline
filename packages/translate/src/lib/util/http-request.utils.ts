export function parseHttpHeaderAcceptLanguages(
  headers?: { [key: string]: string | string[] } | string | string[] | null | undefined,
): string[] {
  // Get header value from input
  let header = '';

  if (typeof headers === 'string') {
    header = headers;
  }

  if (Array.isArray(headers)) {
    header = headers.join(',');
  }

  if (typeof headers === 'object') {
    header = (headers as any)['accept-language'];
    if (Array.isArray(header)) {
      header = header.join(',');
    }
  }

  // Parse header value languages
  const languages: { language: string; q?: number }[] = [];

  const parts = header.split(',');
  for (const part of parts) {
    const [language, q] = part.split(';q=').map((p) => p.trim());

    if (language && !(q !== undefined && q === '0')) {
      languages.push({ language, q: q ? parseFloat(q) : undefined });
    }
  }

  // Sort languages by q value
  languages.sort(({ q: q1 }, { q: q2 }) => {
    if (q1 === q2) return 0;
    if (q1 === undefined) return -1;
    if (q2 === undefined) return 1;
    return q2 - q1;
  });

  return languages.map((l) => l.language);
}
