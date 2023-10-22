// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const codeTheme = require('prism-react-renderer/themes/vsDark');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SkylineJS',
  tagline: 'Toolkit for building efficient, reliable and scalable web applications.',
  favicon: 'logo/favicon-skyline.jpeg',
  url: 'https://skylinejs.com',
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'skylinejs',
  projectName: 'skyline',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/skyline-social.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
      },
      mermaid: {
        theme: { light: 'light', dark: 'dark' },
        options: {
          mirrorActors: false,
        },
      },
      navbar: {
        title: 'SkylineJS',
        logo: {
          alt: '',
          src: 'logo/logo-skyline.jpeg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/skylinejs/skyline',
            position: 'right',
            className: 'header-github-link',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction',
              },
              {
                label: 'Environment',
                to: '/docs/environment',
              },
              {
                label: 'Caching',
                to: '/docs/caching',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/skylinejs/skyline',
              },
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()} SkylineJS`,
      },
      prism: {
        theme: codeTheme,
      },
    }),

  // Privacy-preserving analytics with Umami. See https://umami.is/docs/about
  // Needed to understand which parts of the documentation are most useful or need fixing.
  // Needed to see whether it is worth it to keep writing this open-source software in my free time.
  headTags:
    process.env.NODE_ENV === 'development'
      ? []
      : [
          {
            tagName: 'script',
            attributes: {
              src: 'https://analytics.eu.umami.is/script.js',
              'data-website-id': '77b5f98a-171f-4c63-bf57-d61a8b198cb1',
              defer: 'true',
              async: 'true',
            },
          },
        ],
};

module.exports = config;
