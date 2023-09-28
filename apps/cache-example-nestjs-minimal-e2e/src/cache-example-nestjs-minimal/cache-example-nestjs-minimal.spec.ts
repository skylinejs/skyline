import axios from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/user/1`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ user: undefined });
  });
});
