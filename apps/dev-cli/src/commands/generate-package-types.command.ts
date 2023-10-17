import { SkylineCliCommand } from '@skyline-js/cli';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

export class GeneratePackageTypesCommand extends SkylineCliCommand {
  async run() {
    await this.generatePackageTypes('env');
    await this.generatePackageTypes('cache');
    await this.generatePackageTypes('translate');
  }

  generatePackageTypes(packageName: string) {
    // Generate package types using tsc
    execSync(
      `
        tsc \
        --p packages/${packageName}/tsconfig.lib.json \
        --declaration \
        --emitDeclarationOnly \
        --outFile apps/docs/src/components/MonacoEditor/packages/${packageName}-types.js
      `,
      { cwd: '/repo' },
    );

    // Post-process final module export
    let tscOutput = readFileSync(
      `apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts`,
      'utf-8',
    );
    const declareModuleIndexStart = tscOutput.lastIndexOf('declare module "');
    const declareModuleIndexEnd = tscOutput.indexOf('{', declareModuleIndexStart);

    // Replace module name with package name
    tscOutput =
      tscOutput.slice(0, declareModuleIndexStart) +
      `declare module "@skyline-js/${packageName}" ` +
      tscOutput.slice(declareModuleIndexEnd);

    // Export everything as string
    tscOutput = `export default \`\n${tscOutput.replace(/`/g, '\\`')}\n\`;`;

    // Write final output
    writeFileSync(
      `apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts`,
      tscOutput,
    );

    // Rename file to .ts
    execSync(
      `
        mv \
        apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts \
        apps/docs/src/components/MonacoEditor/packages/${packageName}-types.ts
      `,
      { cwd: '/repo' },
    );
  }
}
