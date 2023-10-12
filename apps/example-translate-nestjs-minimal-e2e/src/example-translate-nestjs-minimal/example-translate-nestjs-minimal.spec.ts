import axios from 'axios';

describe('SkylineTranslate minimal NestJS example', () => {
  beforeAll(async () => {
    await axios.delete(`http://skyline_mailhog:8025/api/v1/messages`);
    // Clear mailhog inbox
  });

  it('Send user registration email (no language header)', async () => {
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

  it('Send user registration email (EN language header)', async () => {
    // Send registration email
    {
      const res = await axios.post(
        `/api/register`,
        { email: 'registration1@skylinejs.com' },
        {
          headers: {
            'Accept-Language': 'EN',
          },
        },
      );
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

  it('Send user registration email (DE language header)', async () => {
    // Send registration email
    {
      const res = await axios.post(
        `/api/register`,
        { email: 'registration2@skylinejs.com' },
        {
          headers: {
            'Accept-Language': 'de',
          },
        },
      );
      expect(res.data).toEqual({ success: true });
    }

    // Check mailhog for the sent email
    {
      const res = await axios.get(
        `http://skyline_mailhog:8025/api/v2/search?kind=containing&query=registration2@skylinejs`,
      );

      // Get correct email
      const email = res.data.items.find((item: any) => item.To[0].Mailbox === 'registration2');
      expect(email).toBeDefined();
      expect(email.Raw.Data).toContain('From: info@skylinejs.com');
      expect(email.Raw.Data).toContain('To: registration2@skylinejs.com');
      expect(email.Raw.Data).toContain('Willkommen bei SkylineJS, registration2@skylinejs');
    }
  });
});
