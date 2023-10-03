import { SkylineCliCommand } from '@skyline-js/cli';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

export class PublishDocsToGithubPagesCommand extends SkylineCliCommand {
  async run() {
    console.log('Publishing docs to github-pages');
    console.log('Running npm run build ...');
    execSync('npm run build', {
      cwd: '/repo/apps/docs/',
      stdio: 'pipe',
      timeout: 60_000,
    });

    console.log('Add CNAME file ... ');
    writeFileSync('/repo/apps/docs/build/CNAME', 'skylinejs.com');

    console.log('Copying build folder to skylinejs.github.io repository ... ');
  }
}
