import Editor from '@monaco-editor/react';
import Layout from '@theme/Layout';
import * as React from 'react';
import monacoService from './monaco.service';

export default class MonacoEditor extends React.Component<{ value: string; height?: number }> {
  render(): React.ReactNode {
    return (
      <div
        style={{
          width: '100%',
          height: this.props.height ?? '300px',
          overflow: 'hidden',
          background: 'rgb(30, 30, 30)',
          borderRadius: 'var(--ifm-code-border-radius)',
        }}
      >
        <Editor
          height="100%"
          width="100%"
          language="typescript"
          defaultLanguage="typescript"
          theme="vs-dark"
          options={{
            language: 'typescript',
            theme: 'vs-dark',
            contextmenu: false,
            fixedOverflowWidgets: true,
            lineDecorationsWidth: 16,
            padding: {
              top: 16,
              bottom: 16,
            },
            scrollbar: {
              vertical: 'auto',
              handleMouseWheel: true,
              alwaysConsumeMouseWheel: false,
            },
            minimap: {
              enabled: false,
            },
            folding: false,
          }}
          defaultValue={this.props.value}
          onMount={(editor, monaco) => {
            monacoService.initMonaco(monaco);
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
