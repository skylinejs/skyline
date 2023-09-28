import axios from 'axios';

describe('GET /api', () => {
  beforeAll(async () => {
    await axios.delete(`/api/user/1`);
  });

  it('Should return "undefined" for non-existent user', async () => {
    const res = await axios.get(`/api/user/1`);
    expect(res.data).toEqual({ user: undefined });
  });

  it('Should create a new user', async () => {
    const { data: creationResult } = await axios.post(`/api/user`, {
      name: 'John Doe',
    });
    expect(creationResult).toMatchObject({ user: { name: 'John Doe' } });

    const { data: getResult } = await axios.get(
      `/api/user/${creationResult.user.id}`
    );
    expect(getResult.user).toEqual(creationResult.user);
  });

  it('Should delete a user', async () => {
    // Create user
    const { data: creationResult } = await axios.post(`/api/user`, {
      name: 'To delete',
    });
    expect(creationResult).toMatchObject({ user: { name: 'To delete' } });

    // Get user - this fills the cache
    {
      const { data: getResult } = await axios.get(
        `/api/user/${creationResult.user.id}`
      );
      expect(getResult.user).toEqual(creationResult.user);
    }

    // Delete user
    const { data: deleteResult } = await axios.delete(
      `/api/user/${creationResult.user.id}`
    );
    expect(deleteResult.id).toEqual(creationResult.user.id);

    {
      // Retrieve user - expect cache to be invalidated
      const { data: getResult } = await axios.get(
        `/api/user/${creationResult.user.id}`
      );
      expect(getResult).toEqual({ user: undefined });
    }
  });
});
