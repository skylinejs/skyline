import Editor from '@monaco-editor/react';
import Layout from '@theme/Layout';
import * as React from 'react';

export default class MonacoEditor extends React.Component {
  render(): React.ReactNode {
    return (
      <div style={{ width: '100%', height: '300px' }}>
        <Editor height="100%" width="100%" language="typescript" defaultValue="test" />
      </div>
    );
  }

  componentDidMount(): void {
    // eslint-disable-next-line no-console
    console.log('mounted');
  }
}
