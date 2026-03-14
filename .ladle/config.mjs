/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'story-src/**/*.stories.{jsx,tsx}',
  outDir: 'stories',
  port: 61000,
  base: 'https://julia-allyce.github.io/react-force-graph/stories/',
  addons: {
    control: { enabled: true },
    source: { enabled: true, defaultState: 'hide' },
    a11y: { enabled: false },
  },
};
