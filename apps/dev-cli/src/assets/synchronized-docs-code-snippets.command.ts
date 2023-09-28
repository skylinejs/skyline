import { readdir } from 'node:fs/promises';
import { join } from 'path';

async function walk(directoryPath: string): Promise<string[]> {
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

export class SynchronizeDocsCodeSnippetsCommand {
  async run() {
    const dirpath = '/repo/apps/docs/docs/';
    const filepaths = await walk(dirpath);
  }
}
