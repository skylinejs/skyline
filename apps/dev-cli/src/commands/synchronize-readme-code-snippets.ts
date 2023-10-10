import { SkylineCliCommand } from '@skyline-js/cli';
import { walk } from '../dev-cli.utils';
import { readFileSync, writeFileSync } from 'fs';

export class SynchronizeReadmeCodeSnippetsCommand extends SkylineCliCommand {
  async run() {
    console.log('Synchronizing code snippets in READMEs...');

    // Get filepaths for all READMEs
    const filepaths = await walk('/repo/packages');
    const readmeFielpaths = filepaths.filter((filepath) =>
      filepath.endsWith('README.md')
    );

    for (const filepath of readmeFielpaths) {
      console.log(`Synchronizing code snippets in ${filepath}...`);
      const content = readFileSync(filepath, 'utf-8');

      let index = 0;
      const replacements: { source: string; target: string }[] = [];

      while (index < content.length) {
        const nextIndex = content.indexOf('<!-- <Include path="', index);
        if (nextIndex === -1) {
          break;
        }

        const start = nextIndex;
        let end = content.indexOf('<!-- </Include> -->', start);

        if (!end) {
          throw new Error(`Could not find end of code block in ${filepath}`);
        }

        end += '-->'.length;

        let pathProperty = content
          .substring(start, end)
          .match(/path="([^"]+)"/)?.[1];

        const includeContent = readFileSync(`/repo/${pathProperty}`, 'utf-8');

        const firstLine = content.substring(
          start,
          start + content.substring(start).indexOf('\n')
        );

        replacements.push({
          source: content.slice(start, end),
          target: `${firstLine}\n` + includeContent + '\n<!-- </Include> -->',
        });

        // Increment index
        index = end;
      }

      let newContent = content;
      for (const { source, target } of replacements) {
        newContent = newContent.replace(source, target);
        console.log(`Replaced include in ${filepath}`);
      }
      writeFileSync(filepath, newContent);
    }

    console.log('Done');
  }
}
