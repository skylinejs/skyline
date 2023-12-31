import React from 'react';
import styles from './styles.module.css';

export function HomepageSection(props: {
  title: string;
  description: string;
  imgSrc: string;
  imgAlt: string;
  ltr?: boolean;
  isLast?: boolean;
}): JSX.Element {
  return (
    <section
      className={styles.section}
      style={{
        background: '#000000',
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: props.ltr ? 'row' : 'row-reverse',
        paddingBottom: props.isLast ? '0px' : undefined,
        height: props.isLast ? 'fit-content' : undefined,
      }}
    >
      {/* Text element */}
      <div
        style={{
          padding: '24px 24px',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '0px',
          maxWidth: '600px',
          justifyContent: 'center',
          alignItems: 'right',
        }}
      >
        <h2 className={styles.sectionTitle}>{props.title}</h2>

        <div className={styles.sectionDescription}>{props.description}</div>
      </div>

      {/* Image element */}
      <div>
        <img
          src={props.imgSrc}
          alt={props.imgAlt}
          style={{
            width: '100%',
            maxWidth: 'min(400px, 50vw)',
            height: 'fit-content',
            objectFit: 'contain',
            objectPosition: '0% 0%',
          }}
        />
      </div>
    </section>
  );
}
