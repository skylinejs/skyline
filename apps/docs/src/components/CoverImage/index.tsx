import React, { Component } from 'react';

export default class CoverImage extends Component<{ src: string }> {
  render(): JSX.Element {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '124px',
        }}
      >
        <img
          style={{
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            height: '200px',
            alignSelf: 'center',
            boxShadow:
              'rgba(15, 15, 15, 0.025) 0px 0px 0px 1px, rgba(15, 15, 15, 0.05) 0px 3px 6px, rgba(15, 15, 15, 0.1) 0px 9px 24px',
          }}
          src={this.props.src}
        />
      </div>
    );
  }
}
