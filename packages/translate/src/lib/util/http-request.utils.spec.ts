import { parseHttpHeaderAcceptLanguages } from './http-request.utils';

describe('parseHttpHeaderAcceptLanguages', () => {
  it('Accept-Language not set/ empty', () => {
    expect(parseHttpHeaderAcceptLanguages()).toEqual([]);
    expect(parseHttpHeaderAcceptLanguages(undefined)).toEqual([]);
  });

  it('Accept-Language: en;q=0.8, es, pt', () => {
    expect(parseHttpHeaderAcceptLanguages('en;q=0.8, es, pt')).toEqual(['es', 'pt', 'en']);
  });
});
