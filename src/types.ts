import type { InfographicOptions, ItemDatum } from '@antv/infographic';
import type { Config as SvgoConfig } from 'svgo';

export type Input = string | ItemDatum[];

export interface RenderOptions extends Omit<InfographicOptions, 'data' | 'container'> {
  optimize?: boolean;
  svgoConfig?: SvgoConfig;
  structure?: string;
  theme?: string;
}

export interface SSRError {
  code: string;
  message: string;
  path: string;
  line: number;
  raw?: string;
}

export interface SSRRenderResult {
  svg: string;
  errors: SSRError[];
  warnings: SSRError[];
}

export type { SvgoConfig };
