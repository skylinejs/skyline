import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      style={{
        position: 'relative',
        padding: '0',
        height: '75vh',
        background: '#080d12',
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
        src="img/background-skyline-4.png"
      />

      <div
        className="container"
        style={{
          position: 'relative',
          padding: '5vw 24px 24px 24px ',
          zIndex: 1,
          alignSelf: 'flex-start',
        }}
      >
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Tutorial
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
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
