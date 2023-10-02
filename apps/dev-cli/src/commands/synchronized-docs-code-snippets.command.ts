import { readFile, readFileSync, writeFileSync } from 'node:fs';
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
    await this.synchronizeAllMarkdownCodeBlocks();
    await this.synchronizeAllDocusaurusCodeTabs();
  }

  private async synchronizeAllMarkdownCodeBlocks() {
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
        const nextIndex = content.indexOf('```ts path="', index);
        if (nextIndex === -1) {
          break;
        }

        const start = nextIndex;
        let end = content.indexOf('```', start + 3);

        if (!end) {
          throw new Error(`Could not find end of code block in ${filepath}`);
        }

        end += '```'.length;
        // console.log({ filepath, content: content.slice(start, end) });

        let pathProperty = content
          .substring(start, end)
          .match(/path="([^"]+)"/)?.[1];

        const codeSnippet = readFileSync(pathProperty, 'utf-8');

        // Write new content
        const firstLine = content.substring(
          start,
          start + content.substring(start).indexOf('\n')
        );
        const newContent = content.replace(
          content.slice(start, end),
          `${firstLine}\n` + codeSnippet + '\n```'
        );
        writeFileSync(filepath, newContent);

        // Increment index
        index = end;
      }
    }
  }

  async synchronizeAllDocusaurusCodeTabs() {
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

        let pathProperty = content
          .substring(start, end)
          .match(/path="([^"]+)"/)?.[1];
        if (!pathProperty.endsWith('/')) {
          pathProperty += '/';
        }

        const orderProperty = content
          .substring(start, end)
          .match(/order="([^"]+)"/)?.[1];

        const codeSnippets = await this.getMarkdownCodeTabItemsForAllFiles(
          pathProperty,
          orderProperty
        );

        // Write new content
        const firstLine = content.substring(
          start,
          start + content.substring(start).indexOf('\n')
        );
        const newContent = content.replace(
          content.slice(start, end),
          `${firstLine}\n` + codeSnippets + '\n</Tabs>'
        );
        writeFileSync(filepath, newContent);

        // Increment index
        index = end;
      }
    }
  }

  private async getMarkdownCodeTabItemsForAllFiles(
    dirpath: string,
    orderStr?: string
  ) {
    const order = (orderStr ?? '').split(',').map((s) => s.trim());
    const filepaths = await walk(dirpath);
    const tsFilepaths = filepaths
      .filter(
        (filepath) => filepath.endsWith('.ts') && !filepath.endsWith('.spec.ts')
      )
      .sort((a, b) => {
        const aIndex = order.findIndex((s) => a.endsWith(s));
        const bIndex = order.findIndex((s) => b.endsWith(s));
        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b);
        }
        if (aIndex === -1) {
          return 1;
        }
        if (bIndex === -1) {
          return -1;
        }
        return aIndex - bIndex;
      });

    const contents: { value: string; label: string; content: string }[] = [];

    tsFilepaths.forEach((filepath) => {
      const content = readFileSync(filepath, 'utf-8');
      const label = filepath.slice(dirpath.length);
      const value = label.replace(/\//g, '-').replace(/\.ts$/, '');
      contents.push({ value, label, content });
    });

    return contents
      .map(({ content, value, label }) => {
        return `<TabItem value="${value}" label="${label}">\n\n\`\`\`ts\n${content}\`\`\`\n\n</TabItem>`;
      })
      .join('\n');
  }
}
