import Editor from '@monaco-editor/react';
import Layout from '@theme/Layout';
import * as React from 'react';

const TEST_VARIABLE_TYPES_MISSING = 2582;
const TOP_LEVEL_AWAIT = 1375;
const RETURN_STATEMENT = 1108;

export default class MonacoEditor extends React.Component<{ content: string }> {
  render(): React.ReactNode {
    return (
      <div style={{ width: '100%', height: '300px' }}>
        <Editor
          height="100%"
          width="100%"
          language="typescript"
          defaultValue={this.props.content}
          onMount={(editor, monaco) => {
            // Basic TypeScript language server setup
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
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

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              target: monaco.languages.typescript.ScriptTarget.ES2020,
              module: monaco.languages.typescript.ModuleKind.ESNext,
              allowNonTsExtensions: true,
              noLib: true,
            });

            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

            // Make sure monaco has no extra libs loaded at startup
            monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
          }}
        />
      </div>
    );
  }

  componentDidMount(): void {
    // eslint-disable-next-line no-console
    console.log('mounted');
  }
}
