import { parseHttpHeaderAcceptLanguages } from './http-request.utils';

describe('parseHttpHeaderAcceptLanguages', () => {
  it('Accept-Language not set/ empty', () => {
    expect(parseHttpHeaderAcceptLanguages()).toEqual([]);
    expect(parseHttpHeaderAcceptLanguages(undefined)).toEqual([]);
  });

  it('Accept-Language: "*"', () => {
    expect(parseHttpHeaderAcceptLanguages('*')).toEqual(['*']);
  });

  it('Accept-Language: "*, en"', () => {
    expect(parseHttpHeaderAcceptLanguages('*, en')).toEqual(['*', 'en']);
  });

  it('Accept-Language: "*, en;q=0"', () => {
    expect(parseHttpHeaderAcceptLanguages('*, en;q=0')).toEqual(['*']);
  });

  it('Accept-Language: "*;q=0.8, en, es"', () => {
    expect(parseHttpHeaderAcceptLanguages('*;q=0.8, en, es')).toEqual(['en', 'es', '*']);
  });

  it('Accept-Language: "en"', () => {
    expect(parseHttpHeaderAcceptLanguages('en')).toEqual(['en']);
  });

  it('Accept-Language: "en;q=0"', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0')).toEqual([]);
  });

  it('Accept-Language: "en;q=0.8, es, pt"', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0.8, es, pt')).toEqual(['es', 'pt', 'en']);
  });

  it('Accept-Language: "en;q=0.8, es"', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0.8, es')).toEqual(['es', 'en']);
  });

  it('Accept-Language: "en;q=0.9, es;q=0.8, en;q=0.7"', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0.9, es;q=0.8, en;q=0.7')).toEqual(['en', 'es']);
  });

  it('Accept-Language: "en;q=0.7, es;q=0.8, en;q=0.9"', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0.7, es;q=0.8, en;q=0.9')).toEqual(['en', 'es']);
  });

  it('Accept-Language: "es;q=0.8, en;q=0.7, en;q=0.9"', () => {
    expect(parseHttpHeaderAcceptLanguages('es;q=0.8, en;q=0.7, en;q=0.9')).toEqual(['en', 'es']);
  });

  it('Accept-Language: "en-US, en;q=0.8"', () => {
    expect(parseHttpHeaderAcceptLanguages('en-US, en;q=0.8')).toEqual(['en-US', 'en']);
  });

  it('Accept-Language: "en-US, en-GB"', () => {
    expect(parseHttpHeaderAcceptLanguages('en-US, en-GB')).toEqual(['en-US', 'en-GB']);
  });

  it('Accept-Language: "en-US;q=0.8, es"', () => {
    expect(parseHttpHeaderAcceptLanguages('en-US;q=0.8, es')).toEqual(['es', 'en-US']);
  });

  it('Accept-Language: "nl;q=0.5, fr, de, en, it, es, pt, no, se, fi, ro"', () => {
    expect(
      parseHttpHeaderAcceptLanguages('nl;q=0.5, fr, de, en, it, es, pt, no, se, fi, ro'),
    ).toEqual(['fr', 'de', 'en', 'it', 'es', 'pt', 'no', 'se', 'fi', 'ro', 'nl']);
  });
});
