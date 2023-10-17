import Editor from '@monaco-editor/react';
import Layout from '@theme/Layout';
import * as React from 'react';
import monacoService from './monaco.service';

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
