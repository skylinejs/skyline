import { SkylineCli } from '@skyline-js/cli';
import { PublishDocsToGithubPagesCommand } from './commands/publish-docs-to-github-pages.command';
import { SynchronizeDocsCodeSnippetsCommand } from './commands/synchronized-docs-code-snippets.command';
import { SynchronizeReadmeCodeSnippetsCommand } from './commands/synchronize-readme-code-snippets';
import { GeneratePackageTypesCommand } from './commands/generate-package-types.command';

new SkylineCli({
  commands: [
    SynchronizeDocsCodeSnippetsCommand,
    PublishDocsToGithubPagesCommand,
    SynchronizeReadmeCodeSnippetsCommand,
    GeneratePackageTypesCommand,
  ],
  inactivityTimeout: 1_000 * 60 * 60 * 24, // 1 day
}).run();
