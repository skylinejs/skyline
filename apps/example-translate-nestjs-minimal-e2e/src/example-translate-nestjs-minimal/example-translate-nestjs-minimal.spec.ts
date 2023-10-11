import axios from 'axios';

describe('SkylineTranslate minimal NestJS example', () => {
  it('Send user registration email', async () => {
    const res = await axios.post(`/api/register`, { email: 'registration1@skylinejs.com' });
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
