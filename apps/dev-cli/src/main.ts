import { SkylineCli } from '@skyline-js/cli';
import { PublishDocsToGithubPagesCommand } from './commands/publish-docs-to-github-pages.command';
import { SynchronizeDocsCodeSnippetsCommand } from './commands/synchronized-docs-code-snippets.command';

new SkylineCli({
  commands: [
    SynchronizeDocsCodeSnippetsCommand,
    PublishDocsToGithubPagesCommand,
  ],
  commandDisplayNameCapitalize: true,
}).run();
