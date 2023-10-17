import { Monaco } from '@monaco-editor/react';
import CacheTypes from './packages/cache-types';
import EnvTypes from './packages/env-types';
import TranslateTypes from './packages/translate-types';

const TEST_VARIABLE_TYPES_MISSING = 2582;
const TOP_LEVEL_AWAIT = 1375;
const RETURN_STATEMENT = 1108;

class MonacoService {
  private monaco?: Monaco;
  private initialized = false;

  initMonaco(monaco: Monaco) {
    if (this.initialized) return;
    this.initialized = true;
    this.monaco = monaco;

    // Set up the default compiler options for typescript
    this.setMonacoTypescriptDefaults();

    // Add libraries
    this.addExtraTsLib({ types: EnvTypes });
    this.addExtraTsLib({ types: CacheTypes });
    this.addExtraTsLib({ types: TranslateTypes });
  }

  setMonacoTypescriptDefaults() {
    // Basic TypeScript language server setup
    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [
        TOP_LEVEL_AWAIT,
        2304,
        2339, // Property does not exist on union type
        2345, // map on a union type wit desctructuring, e.g. for reassigning field values
        2451,
        2584,
        2585,
        2531, // null in <,>,<=,>= etc.
        6200, // Definitions conflict with those in another file
        RETURN_STATEMENT,
        TEST_VARIABLE_TYPES_MISSING,
      ],
    });

    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: this.monaco.languages.typescript.ScriptTarget.ES2020,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      allowNonTsExtensions: true,
      noLib: false,
    });

    this.monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    // Make sure monaco has no extra libs loaded at startup
    this.monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
  }

  addExtraTsLib({ filename, types }: { filename?: string; types: string }): {
    dispose: () => void;
  } {
    if (!this.monaco) {
      throw new Error(`MonacoService.addExtraTsLib was called before initialization!`);
    }
    // console.log('Adding TS lib: ' + filename);
    const disposer = this.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      types,
      filename,
    );

    return disposer;
  }
}

// Is this how you do singleton services in React?
export default new MonacoService();
