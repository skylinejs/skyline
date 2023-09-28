import { readFileSync, writeFileSync } from 'node:fs';
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
    // Get all markdown files
    const dirpath = '/repo/apps/docs/docs/';
    const filepaths = await walk(dirpath);
    const markdownfilepaths = filepaths.filter((filepath) =>
      filepath.endsWith('.md')
    );

    // Replace all code blocks with path property with the respective file's content
    for (const filepath of markdownfilepaths) {
      const content = readFileSync(filepath, 'utf-8');

      let index = 0;
      // Find all code blocks with path property
      while (index < content.length) {
        const nextIndex = content.indexOf('<Tabs path="', index);
        if (nextIndex === -1) {
          break;
        }

        const start = nextIndex;
        let end = content.indexOf('</Tabs>', start);

        if (!end) {
          throw new Error(`Could not find end of Tabs block in ${filepath}`);
        }

        end += '</Tabs>'.length;

        const pathProperty = content
          .substring(start, end)
          .match(/path="(.*)"/)?.[1];

        console.log({ pathProperty });
        console.log(content.slice(start, end));

        const codeSnippets = await this.getMarkdownCodeSnippetsForAllFiles(
          pathProperty
        );

        // Write new content
        const newContent = content.replace(
          content.slice(start, end),
          `<Tabs path="${pathProperty}">\n` + codeSnippets + '\n</Tabs>'
        );
        writeFileSync(filepath, newContent);

        // Increment index
        index = end;
      }
    }
  }

  private async getMarkdownCodeSnippetsForAllFiles(dirpath: string) {
    const filepaths = await walk(dirpath);
    const tsFilepaths = filepaths.filter(
      (filepath) => filepath.endsWith('.ts') && !filepath.endsWith('.spec.ts')
    );

    const contents: { value: string; label: string; content: string }[] = [];

    tsFilepaths.forEach((filepath) => {
      const content = readFileSync(filepath, 'utf-8');
      const label = filepath.slice(dirpath.length);
      const value = label.replace(/\//g, '-').replace(/\.ts$/, '');
      contents.push({ value, label, content });
    });

    return contents
      .map(({ content, value, label }) => {
        return `<TabItem value="${value}" label="${label}">\n\n\`\`\`ts\n${content}\n\`\`\`\n\n</TabItem>`;
      })
      .join('\n');
  }
}
