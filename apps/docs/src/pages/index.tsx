import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import TerminalSquareIcon from '@site/static/icon/terminal-square.svg';
import { HomepageSection } from '../components/HomepageSection';
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

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description={`${siteConfig.title} - ${siteConfig.tagline}`}>
      <HomepageHeader />

      <main style={{ width: '100%', background: '#000000' }}>
        <HomepageSection
          ltr={true}
          title="For modern Node.js applications"
          description="TypeScript native, fast, and simple. Use the latest technologies to build your next application."
          imgSrc="profile/skylinejs-silvio.png"
          imgAlt="Silvio"
        />

        <HomepageSection
          ltr={false}
          title="Focus on delivering value"
          description="Don't get bogged down by implementing the basics. SkylineJS provides you with everything you need to build your application so that you can focus on delivering value to your users."
          imgSrc="profile/skylinejs-tony.png"
          imgAlt="Tony"
        />

        <HomepageSection
          ltr={true}
          title="Deploy to production with confidence"
          description="You are in good company. Each SkylineJS library was internally developed and used in production for years before being open sourced."
          imgSrc="profile/skylinejs-big-papa.png"
          imgAlt="Big Papa"
        />

        <HomepageSection
          ltr={false}
          title="A strong foundation"
          description="Insane test coverage, typed, and well documented. SkylineJS libraries are a rock solid foundation for your next project."
          imgSrc="profile/skylinejs-jordan.png"
          imgAlt="Jordan"
        />
      </main>
    </Layout>
  );
}
