import axios from 'axios';

describe('SkylineTranslate minimal NestJS example', () => {
  it('Send user registration email', async () => {
    const res = await axios.get(`/api`);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
