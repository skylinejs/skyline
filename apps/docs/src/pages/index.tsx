import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  const backgroundId = 8; // Math.floor(Math.random() * 4) + 1;
  return (
    <header
      style={{
        position: 'relative',
        padding: '0',
        height: '75vh',
        background: '#080d12',
        color: '#fff',
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
        src={'img/background-skyline-' + backgroundId + '.png'}
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
            fontFamily: 'Miami Beat, inter',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            fontSize: 'min(26px, 5vw)',
            fontWeight: 900,
            maxWidth: '700px',
            textAlign: 'center',
            alignSelf: 'center',
            padding: '0px 14px',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              backgroundColor: 'rgba(0,0,0, 0.85)',
              lineHeight: '36px',
              color: 'rgbb  (186, 44, 115)',
              padding: '2px 0px 0px 4px',
              letterSpacing: '3px',
              fontStyle: 'normal',
            }}
          >
            {siteConfig.tagline}
          </span>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
            style={{
              marginTop: '24px',
              borderRadius: '12px',
            }}
          >
            Documentation
          </Link>
        </div>
      </div>
    </header>
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
      <main></main>
    </Layout>
  );
}
