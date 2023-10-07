import React from 'react';
import clsx from 'clsx';

export function HomepageSection(): JSX.Element {
  return (
    <div
      style={{
        background: 'black',
        height: '80vh',
        zIndex: 1,
        overflow: 'hidden',
        paddingTop: '46px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {/* Right text */}
        <div
          style={{
            padding: '0px 24px',
            display: 'flex',
            height: 'fit-content',
            flexDirection: 'column',
            flex: 1,
            minWidth: '0px',
            maxWidth: '500px',
            justifyContent: 'top',
            alignItems: 'right',
          }}
        >
          <h2 style={{ width: 'fit-content' }}>
            <span
              style={{
                color: 'rgba(237,237,239,1)',
                fontSize: '32px',
                lineHeight: '44px',
                fontWeight: 500,
                fontFamily: ' inter',
                display: 'inline',
              }}
            >
              Deploy to production with confidence
            </span>
          </h2>

          <div
            style={{
              color: 'rgb(126, 125, 134)',
              fontSize: '18px',
              lineHeight: '28px',
              fontWeight: 400,
              fontFamily: ' inter',
              display: 'inline',
            }}
          >
            You are in good company. Each SkylineJS library was internally
            developed and used in production for years before being open
            sourced.
          </div>
        </div>

        {/* Left graphic */}
        <div>
          <img
            src={'author-profile/bear-1.png'}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'fit-content',
              objectFit: 'contain',
              objectPosition: '0% 0%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
