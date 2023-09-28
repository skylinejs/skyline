import * as inquirer from 'inquirer';
import { SynchronizeDocsCodeSnippetsCommand } from './assets/synchronized-docs-code-snippets.command';

async function main() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { command } = await inquirer.default.prompt([
      {
        message: 'Command',
        type: 'list',
        name: 'command',
        choices: [
          {
            name: 'synchronize-docs-code-snippets',
            value: 'synchronize-docs-code-snippets',
          },
          {
            name: 'email-send',
            value: 'email-send',
          },
        ],
      },
    ]);

    switch (command) {
      case 'synchronize-docs-code-snippets': {
        await new SynchronizeDocsCodeSnippetsCommand().run();
      }
    }
  }
}

void main();
