import { readFile, readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'path';

export async function walk(directoryPath: string): Promise<string[]> {
  const filepaths = await Promise.all(
    await readdir(directoryPath, { withFileTypes: true }).then((entries) =>
      entries.map((entry) => {
        const childPath = join(directoryPath, entry.name);
        return entry.isDirectory() ? walk(childPath) : childPath;
      })
    )
  );

  return filepaths.flat(Number.POSITIVE_INFINITY) as string[];
}
