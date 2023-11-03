import { Flags, SkylineCliCommand } from '@skyline-js/cli';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

export class GeneratePackageTypesCommand extends SkylineCliCommand {
  constructor() {
    super();
  }

  static flags = {
    packages: Flags.string({
      char: 'p',
      default: ['env', 'cache', 'translate'],
      options: ['env', 'cache', 'translate'],
      multiple: true,
    }),
  };

  async run() {
    const {
      flags: { packages },
    } = await this.parse(GeneratePackageTypesCommand);
    for (const packageName of packages) {
      process.stdout.write(`Generating types for package ${packageName}... `);
      await this.generatePackageTypes(packageName);
      process.stdout.write(`Done\n`);
    }
  }

  generatePackageTypes(packageName: string) {
    // Generate package types using tsc
    execSync(
      `
        tsc \
        --p packages/${packageName}/tsconfig.lib.json \
        --declaration \
        --emitDeclarationOnly \
        --outFile /repo/apps/docs/src/components/MonacoEditor/packages/${packageName}-types.js
      `,
      { cwd: '/repo' },
    );

    // Post-process final module export
    let tscOutput = readFileSync(
      `/repo/apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts`,
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
      `/repo/apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts`,
      tscOutput,
    );

    // Rename file to .ts
    execSync(
      `
        mv \
        /repo/apps/docs/src/components/MonacoEditor/packages/${packageName}-types.d.ts \
        /repo/apps/docs/src/components/MonacoEditor/packages/${packageName}-types.ts
      `,
      { cwd: '/repo' },
    );
  }
}
