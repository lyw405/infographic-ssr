import { optimize as svgoOptimize, type Config as SvgoConfig } from 'svgo';

const defaultSvgoConfig: SvgoConfig = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
    'removeDimensions',
    'sortAttrs',
  ],
};

export function optimizeSVG(svg: string, config?: SvgoConfig): string {
  const mergedConfig = config ?? defaultSvgoConfig;
  const result = svgoOptimize(svg, mergedConfig);
  return result.data;
}
