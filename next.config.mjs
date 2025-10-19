import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/
});

const nextConfig = {
  experimental: {
    appDir: true
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx']
};

export default withMDX(nextConfig);
