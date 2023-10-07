import React, { Component } from 'react';
const Chart = require('chart.js/auto');

export default class CachingChart extends Component {
  componentDidMount(): void {
    const data = [
      { year: 2010, count: 10 },
      { year: 2011, count: 20 },
      { year: 2012, count: 15 },
      { year: 2013, count: 25 },
      { year: 2014, count: 22 },
      { year: 2015, count: 30 },
      { year: 2016, count: 28 },
    ];

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
        labels: data.map((row) => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map((row) => row.count),
          },
          {
            label: 'Acquisitions by month',
            data: data.reverse().map((row) => row.count),
          },
        ],
      },
    });
  }

  render(): JSX.Element {
    return (
      <section>
        <canvas
          id="cache-chart"
          style={{ width: '100%', height: '200px' }}
        ></canvas>
      </section>
    );
  }
}
