import { SynchronizeDocsCodeSnippetsCommand } from './commands/synchronized-docs-code-snippets.command';
import { PublishDocsToGithubPagesCommand } from './commands/publish-docs-to-github-pages.command';
import { SkylineCli } from '@skyline-js/cli';
import inquirer from 'inquirer';

async function main() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { command } = await inquirer.prompt([
      {
        message: 'Command',
        type: 'list',
        name: 'command',
        choices: [
          {
            name: 'Synchronize docs code-snippets',
            value: 'synchronize-docs-code-snippets',
          },
          {
            name: 'Publish docs to github-pages',
            value: 'publish-docs-to-github-pages',
          },
        ],
      },
    ]);

    switch (command) {
      case 'synchronize-docs-code-snippets': {
        await new SynchronizeDocsCodeSnippetsCommand().run();
        break;
      }

      case 'publish-docs-to-github-pages': {
        await new PublishDocsToGithubPagesCommand().run();
      }
    }
  }
}

// void main();
const cli = new SkylineCli();
void cli.run();
