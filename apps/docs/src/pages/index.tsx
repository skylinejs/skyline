import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import TerminalSquareIcon from '@site/static/icon/terminal-square.svg';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header
      style={{
        position: 'relative',
        padding: '0',
        height: '95vh',
        background: '#080d12',
        color: '#fff',
        zIndex: 0,
      }}
      className={clsx('hero hero--primary', styles.heroBanner)}
    >
      <img
        width="100%"
        height="100%"
        style={{
          objectFit: 'cover',
          objectPosition: '50% 0%',
          position: 'absolute',
          zIndex: 0,
          overflow: 'hidden',
        }}
        src={'img/skylinejs-background.png'}
      />

      <div
        className="container"
        style={{
          position: 'relative',
          padding: '16px 24px 24px 24px ',
          zIndex: 1,
          alignSelf: 'flex-start',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1
          className="hero__title"
          style={{
            color: '#fff',
            fontFamily: 'Neon Led Light, inter',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            fontSize: 'min(64px, 10vw)',
            lineHeight: '80px',
            fontWeight: 900,
            paddingBottom: '16px',
            fontStyle: 'normal',
          }}
        >
          {siteConfig.title}
        </h1>
        <p
          className="hero__subtitle"
          style={{
            color: '#fff',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            maxWidth: '700px',
            textAlign: 'center',
            alignSelf: 'center',
            padding: '0px 14px',
          }}
        >
          <span
            style={{
              fontWeight: 400,
              fontFamily: 'Miami Beat, inter',
              backgroundColor: 'rgba(0,0,0, 0.85)',
              fontSize: 'min(28px, 5vw)',
              lineHeight: '36px',
              color: 'rgbb  (186, 44, 115)',
              padding: '2px 0px 0px 4px',
              letterSpacing: '2px',
              fontStyle: 'normal',
            }}
          >
            {siteConfig.tagline}
          </span>
        </p>
        <div>
          <Link
            className={
              'button button--secondary button--lg .docuLink ' + styles.docuLink
            }
            draggable={false}
            to="/docs/introduction"
            style={{
              marginTop: '24px',
              borderRadius: '12px',
              color: '#FFFFFF',
              outline: 'none',
              fontWeight: 700,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                'rgba(255, 255, 255, 1) 0px 0px 8px, rgba(255, 255, 255, 1) 0px 0px 0px 1px inset',
            }}
          >
            <TerminalSquareIcon
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFirstSection(): JSX.Element {
  return (
    <div
      style={{
        background: 'black',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        zIndex: 1,
        overflow: 'hidden',
        justifyContent: 'space-between',
      }}
    >
      {/* Left graphic */}
      <div>
        <img
          src={'profile/skylinejs-jordan.png'}
          alt="Jordan"
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '100%',
            objectFit: 'contain',
            objectPosition: '0% 0%',
          }}
        />
      </div>

      {/* Right text */}
      <div
        style={{
          padding: '0px 24px',
          display: 'flex',
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
            A strong foundation
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
          Insane test coverage, typed, and well documented. SkylineJS libraries
          are a rock solid foundation for your next project.
        </div>
      </div>
    </div>
  );
}

function HomepageSecondSection(): JSX.Element {
  return (
    <div
      style={{
        background: 'black',
        height: '80vh',
        zIndex: 1,
        overflow: 'hidden',
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
              For modern Node.js applications
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
            TypeScript native, fast, and simple. Use the latest technologies to
            build your next application.
          </div>
        </div>

        {/* Left graphic */}
        <div>
          <img
            src={'profile/skylinejs-silvio.png'}
            alt="Silvio"
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

function HomepageThirdSection(): JSX.Element {
  return (
    <div
      style={{
        background: 'black',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        zIndex: 1,
        overflow: 'hidden',
        justifyContent: 'space-between',
      }}
    >
      {/* Left graphic */}
      <div>
        <img
          src={'profile/skylinejs-tony.png'}
          alt="Tony"
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '100%',
            objectFit: 'contain',
            objectPosition: '0% 0%',
          }}
        />
      </div>

      {/* Right text */}
      <div
        style={{
          padding: '0px 24px',
          display: 'flex',
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
            Focus on delivering value
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
          Don't get bogged down by implementing the basics. SkylineJS provides
          you with everything you need to build your application so that you can
          focus on delivering value to your users.
        </div>
      </div>
    </div>
  );
}

function HomepageFourthSection(): JSX.Element {
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
            src={'profile/skylinejs-big-papa.png'}
            alt="Big Papa"
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

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={`${siteConfig.title} - ${siteConfig.tagline}`}
    >
      <HomepageHeader />

      <HomepageSecondSection />
      <HomepageThirdSection />
      <HomepageFourthSection />
      <HomepageFirstSection />
    </Layout>
  );
}
