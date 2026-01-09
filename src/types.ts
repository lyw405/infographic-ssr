import type { InfographicOptions, ItemDatum } from '@antv/infographic';
import type { Config as SvgoConfig } from 'svgo';

export type Input = string | ItemDatum[];

export interface RenderOptions extends Omit<InfographicOptions, 'data' | 'container'> {
  optimize?: boolean;
  svgoConfig?: SvgoConfig;
}

export type { SvgoConfig };
