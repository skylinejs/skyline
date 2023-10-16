import React, { Component } from 'react';
const Chart = require('chart.js/auto');
import CachingStatisticsData from './caching-statistics-demo.json';

export default class CachingChart extends Component {
  componentDidMount(): void {
    const data = CachingStatisticsData;
    new Chart(document.getElementById('cache-chart'), {
      type: 'bar',
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
      data: {
        labels: data.map((row) => row.timestamp),
        datasets: [
          { label: 'Cache hits', data: data.map((row) => row['Cache hits']) },
          { label: 'Cache misses', data: data.map((row) => row['Cache misses']) },
          { label: 'Cache skips', data: data.map((row) => row['Cache skips']) },
          { label: 'Consistency checks', data: data.map((row) => row['Consistency checks']) },
          { label: 'Cache invalidations', data: data.map((row) => row['Cache invalidations']) },
        ],
      },
    });
  }

  render(): JSX.Element {
    return (
      <section>
        <canvas id="cache-chart" style={{ width: '100%', height: '200px' }}></canvas>
      </section>
    );
  }
}
