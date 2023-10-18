import axios from 'axios';

describe('[CI] SkylineEnv minimal NestJS example', () => {
  beforeAll(async () => {
    // Clear mailhog inbox
    await axios.delete(`http://skyline_mailhog:8025/api/v1/messages`);

    // Check server runtime
    const {
      data: { runtime },
    } = await axios.get(`/api/runtime-env`);
    expect(runtime).toEqual('CI');
  });

  it('Send registration email', async () => {
    // Send registration email
    {
      const res = await axios.post(`/api/register`, { email: 'registration1@skylinejs.com' });
      expect(res.data).toEqual({ success: true });
    }

    // Check mailhog for the sent email
    {
      const res = await axios.get(
        `http://skyline_mailhog:8025/api/v2/search?kind=containing&query=registration1@skylinejs`,
      );

      // Get correct email
      const email = res.data.items.find((item: any) => item.To[0].Mailbox === 'registration1');
      expect(email).toBeDefined();
      expect(email.Raw.Data).toContain('From: info@skylinejs.com');
      expect(email.Raw.Data).toContain('To: registration1@skylinejs.com');
      expect(email.Raw.Data).toContain('Welcome to SkylineJS, registration1@skylinejs');
    }
  });
});
