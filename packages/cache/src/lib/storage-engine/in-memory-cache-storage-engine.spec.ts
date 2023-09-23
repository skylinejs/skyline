import { InMemoryCacheStorageEngine } from './in-memory-cache-storage-engine';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms).unref());
}

describe('InMemoryCacheStorageEngine', () => {
  it('Set and retrieve a key', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.set('key', 'value');
    const value = await storage.get('key');
    expect(value).toEqual('value');
  });

  it('Set and retrieve multiple keys', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
    const [value1, value2] = await storage.getMany(['key1', 'key2']);
    expect(value1).toEqual('value1');
    expect(value2).toEqual('value2');
  });

  it('Retrieve multiple keys with partial hits', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value1' },
      { key: 'key3', value: 'value3' },
    ]);
    const [value1, value2, value3, value4] = await storage.getMany([
      'key1',
      'key2',
      'key3',
      'key4',
    ]);
    expect(value1).toEqual('value1');
    expect(value2).toEqual(undefined);
    expect(value3).toEqual('value3');
    expect(value4).toEqual(undefined);
  });

  it('Retrieve multiple keys with duplicate entries', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
    const [value1, value2, value3, value4, value5, value6] =
      await storage.getMany(['key1', 'key2', 'key1', 'key1', 'key3', 'key2']);
    expect(value1).toEqual('value1');
    expect(value2).toEqual('value2');
    expect(value3).toEqual('value1');
    expect(value4).toEqual('value1');
    expect(value5).toEqual(undefined);
    expect(value6).toEqual('value2');
  });

  it('Only set a key if not does exist already', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setIfNotExist('key1', 'value1');
    await storage.setIfNotExist('key1', 'value2');
    await storage.setIfNotExist('key2', 'value2');

    const value1 = await storage.get('key1');
    expect(value1).toEqual('value1');

    const value2 = await storage.get('key2');
    expect(value2).toEqual('value2');
  });

  it('Set a key with expiration', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.set('key1', 'value1', { expiresIn: 100 });

    // Check that the key is still there
    {
      const value1 = await storage.get('key1');
      expect(value1).toEqual('value1');
    }

    await delay(150);

    // Check that the key is gone after expiration
    {
      const value1 = await storage.get('key1');
      expect(value1).toEqual(undefined);
    }
  });

  it('Set multiple keys with expiration', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value1', expiresIn: 100 },
      { key: 'key2', value: 'value2', expiresIn: 100 },
    ]);

    // Check that the keys are still there
    {
      const [value1, value2] = await storage.getMany(['key1', 'key2']);
      expect(value1).toEqual('value1');
      expect(value2).toEqual('value2');
    }

    await delay(150);

    // Check that the keys are gone after expiration
    {
      const [value1, value2] = await storage.getMany(['key1', 'key2']);
      expect(value1).toEqual(undefined);
      expect(value2).toEqual(undefined);
    }
  });

  it('Retrieve keys by pattern', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value-key1' },
      { key: 'key2', value: 'value-key2' },
      { key: 'key3', value: 'value-key3' },
      { key: 'item1', value: 'value-item1' },
      { key: 'item2', value: 'value-item2' },
      { key: 'item3', value: 'value-item3' },
      { key: 'other', value: 'value-other' },
    ]);

    // Retrieve all keys
    {
      const keys = await storage.getKeysByPattern('*');
      expect(keys.sort()).toEqual(
        ['key1', 'key2', 'key3', 'item1', 'item2', 'item3', 'other'].sort()
      );
    }

    // Retrieve all keys: ensure that wildcard can match zero times
    {
      const keys = await storage.getKeysByPattern('******************');
      expect(keys.sort()).toEqual(
        ['key1', 'key2', 'key3', 'item1', 'item2', 'item3', 'other'].sort()
      );
    }

    // Retrieve "key*"" by pattern
    {
      const keys = await storage.getKeysByPattern('key*');
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3'].sort());
    }

    // Retrieve "item*" by pattern
    {
      const keys = await storage.getKeysByPattern('item*');
      expect(keys.sort()).toEqual(['item1', 'item2', 'item3'].sort());
    }

    // Retrieve "*1" by pattern
    {
      const keys = await storage.getKeysByPattern('*1');
      expect(keys.sort()).toEqual(['key1', 'item1'].sort());
    }

    // Retrieve "*2" by pattern
    {
      const keys = await storage.getKeysByPattern('*2');
      expect(keys.sort()).toEqual(['key2', 'item2'].sort());
    }

    // Retrieve "*3" by pattern
    {
      const keys = await storage.getKeysByPattern('*3');
      expect(keys.sort()).toEqual(['key3', 'item3'].sort());
    }

    // Retrive "*e*1" by pattern
    {
      const keys = await storage.getKeysByPattern('*e*1');
      expect(keys.sort()).toEqual(['key1', 'item1'].sort());
    }

    // Retrive "*t*" by pattern
    {
      const keys = await storage.getKeysByPattern('*t*');
      expect(keys.sort()).toEqual(['item1', 'item2', 'item3', 'other'].sort());
    }
  });

  it('Retrieve keys with special characters by pattern', async () => {
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    await storage.setMany([
      { key: 'key1', value: 'value-key1' },
      { key: 'key2', value: 'value-key2' },
      { key: 'key3', value: 'value-key3' },
      { key: 'item1', value: 'value-item1' },
      { key: 'item2', value: 'value-item2' },
      { key: 'item3', value: 'value-item3' },
      { key: 'other', value: 'value-other' },
      { key: '*', value: 'value-asterisk' },
      { key: '**', value: 'value-double-asterisk' },
      { key: '*-more', value: 'value-asterisk-more' },
      { key: 'prefix-*', value: 'value-prefix-asterisk' },
      { key: '\\', value: 'value-backslash' },
    ]);

    // Get "\*" by pattern
    {
      const keys = await storage.getKeysByPattern('\\*');
      expect(keys).toEqual(['*']);
    }

    // Get "\**" by pattern
    {
      const keys = await storage.getKeysByPattern('\\**');
      expect(keys).toEqual(['*', '**', '*-more']);
    }

    // Get "*\*" by pattern
    {
      const keys = await storage.getKeysByPattern('*\\*');
      expect(keys).toEqual(['*', '**', 'prefix-*']);
    }

    // Get "\" by pattern
    {
      const keys = await storage.getKeysByPattern('\\\\');
      expect(keys).toEqual(['\\']);
    }
  });
});
