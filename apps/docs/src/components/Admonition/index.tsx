import React from 'react';
import Admonition from '@theme-original/Admonition';
import AdmonitionIcon from '@site/static/icon/coffee.svg';
import styles from './styles.module.css';

export default function SkylineAdmonition(props) {
  if (props.type !== 'info') {
    return <Admonition {...props} />;
  }
  return (
    <div className={styles.admonition}>
      <Admonition title="Info" icon={<AdmonitionIcon />} {...props} />
    </div>
  );
}
