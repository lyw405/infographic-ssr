import '@antv/infographic';
import { Infographic } from '@antv/infographic';
import type { InfographicOptions } from '@antv/infographic';
import { initGlobalEnv } from './env';
import { optimizeSVG } from './optimize';
import type { Input, RenderOptions } from './types';

const DEFAULT_TEMPLATE = 'list-grid-simple';

function createInfographicInput(
  input: Input,
  options?: RenderOptions
): string | Partial<InfographicOptions> {
  const { optimize: _, svgoConfig: __, ...restOptions } = options ?? {};

  if (typeof input === 'string') {
    const hasOptions = Object.keys(restOptions).length > 0;
    if (!hasOptions) {
      return input;
    }
    return {
      template: restOptions.template || DEFAULT_TEMPLATE,
      ...restOptions,
    };
  }

  const template = restOptions.template || DEFAULT_TEMPLATE;

  const mergedOptions: Partial<InfographicOptions> = {
    template,
    ...restOptions,
    data: { items: input } as InfographicOptions['data'],
  };

  return mergedOptions;
}

export async function renderToSVG(
  input: Input,
  options?: RenderOptions
): Promise<SVGSVGElement> {
  initGlobalEnv();

  const infographicInput = createInfographicInput(input, options);
  const infographic = new Infographic(infographicInput);

  return new Promise((resolve, reject) => {
    infographic.on('error', (error: Error) => {
      reject(error);
    });

    try {
      const parsedOptions = (infographic as any).parsedOptions;

      if (!parsedOptions?.design?.structure) {
        reject(new Error('Failed to parse design options. Please provide valid template or design configuration.'));
        return;
      }

      const svg = infographic.compose(parsedOptions);
      resolve(svg);
    } catch (error) {
      reject(error);
    }
  });
}

export async function renderToSVGString(
  input: Input,
  options?: RenderOptions
): Promise<string> {
  initGlobalEnv();

  const svg = await renderToSVG(input, options);

  let svgString = (svg as any).outerHTML || svg.toString();

  if (options?.optimize) {
    svgString = optimizeSVG(svgString, options.svgoConfig);
  }

  return svgString;
}
