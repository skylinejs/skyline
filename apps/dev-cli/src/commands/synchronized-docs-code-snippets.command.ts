import { SkylineCliCommand } from '@skyline-js/cli';
import { readFileSync, writeFileSync } from 'node:fs';
import { walk } from '../dev-cli.utils';

interface CodeBlockProperties {
  filepath?: string;
  skipLines?: number;
  remove?: string[];
}

export class SynchronizeDocsCodeSnippetsCommand extends SkylineCliCommand {
  async run() {
    console.log('Synchronizing code snippets in docs...');
    await this.synchronizeAllMarkdownCodeBlocks();
    await this.synchronizeAllDocusaurusCodeTabs();
    console.log('Done');
  }

  private parseCodeBlockProperties(
    line: string
  ): CodeBlockProperties | undefined {
    const properties: CodeBlockProperties = {};

    const pathMatch = line.match(/path="([^"]+)"/);
    if (pathMatch) {
      properties.filepath = pathMatch[1];
    }

    // Abort if no path property was found
    if (!properties.filepath) return undefined;

    const skipLinesMatch = line.match(/skipLines="(\d+)"/);
    if (skipLinesMatch) {
      properties.skipLines = parseInt(skipLinesMatch[1]);
    }

    const replaceMatch = line.match(/remove="([^"]+)"/);
    if (replaceMatch) {
      properties.remove = replaceMatch[1].split(',');
    }

    return properties;
  }

  private readeSourceFile({
    filepath,
    remove,
    skipLines,
  }: CodeBlockProperties): string {
    const fileContent = readFileSync(filepath, 'utf-8');
    const lines = fileContent.split('\n');

    // Skip lines
    if (skipLines) {
      lines.splice(0, skipLines);
    }

    // Remove strings
    if (remove) {
      for (const replaceString of remove) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          lines[i] = line.replace(replaceString, '');
        }
      }
    }

    // Always remove "\" character at the end of a line
    // This is only needed for linebreaks in multi-line comments for VSCode inline documentation
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      lines[i] = line.replace(/\\$/, '');
    }

    return lines.join('\n');
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
      const replacements: { source: string; target: string }[] = [];
      // Find all code blocks with path property
      while (index < content.length) {
        const nextIndex = content.indexOf('```ts', index);
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

        const codeProperties = this.parseCodeBlockProperties(
          content.slice(start, end)
        );
        if (codeProperties) {
          // Write new content
          const firstLine = content.substring(
            start,
            start + content.substring(start).indexOf('\n')
          );
          replacements.push({
            source: content.slice(start, end),
            target:
              `${firstLine}\n` + this.readeSourceFile(codeProperties) + '```',
          });
        }

        // Increment index
        index = end;
      }

      let newContent = content;
      for (const { source, target } of replacements) {
        newContent = newContent.replace(source, target);
      }
      writeFileSync(filepath, newContent);
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
      const replacements: { source: string; target: string }[] = [];

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

        replacements.push({
          source: content.slice(start, end),
          target: `${firstLine}\n` + codeSnippets + '\n</Tabs>',
        });

        // Increment index
        index = end;
      }

      let newContent = content;
      for (const { source, target } of replacements) {
        newContent = newContent.replace(source, target);
      }
      writeFileSync(filepath, newContent);
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
