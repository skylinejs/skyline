import { SkylineCli } from '@skyline-js/cli';
import { PublishDocsToGithubPagesCommand } from './commands/publish-docs-to-github-pages.command';
import { SynchronizeDocsCodeSnippetsCommand } from './commands/synchronized-docs-code-snippets.command';

new SkylineCli({
  commands: [
    SynchronizeDocsCodeSnippetsCommand,
    PublishDocsToGithubPagesCommand,
  ],
  inactivityTimeout: 1_000 * 60 * 60 * 24, // 1 day
}).run();
