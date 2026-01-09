import { Infographic, parseSyntax } from '@antv/infographic';
import type { InfographicOptions } from '@antv/infographic';
import { initGlobalEnv } from './env.js';
import { optimizeSVG } from './optimize.js';
import { waitForIconsAndEmbed, cleanupSVG } from './postprocess.js';
import { setupDefaultResourceLoader } from './resource-loader.js';
import type { Input, RenderOptions, SSRError, SSRRenderResult } from './types.js';

const DEFAULT_TEMPLATE = 'list-grid-simple';

function createInfographicOptions(
  input: Input,
  options?: RenderOptions
): Partial<InfographicOptions> {
  const { optimize: _, svgoConfig: __, ...restOptions } = options ?? {};

  if (typeof input === 'string') {
    const { options: parsedSyntaxOptions } = parseSyntax(input);
    return {
      ...parsedSyntaxOptions,
      ...restOptions,
      editable: false,
    };
  }

  const template = restOptions.template || DEFAULT_TEMPLATE;
  const existingData = restOptions.data || {};

  return {
    template,
    ...restOptions,
    data: { ...existingData, items: input } as InfographicOptions['data'],
    editable: false,
  };
}

export async function renderToSVG(
  input: Input,
  options?: RenderOptions
): Promise<SVGSVGElement> {
  const { document } = initGlobalEnv();
  setupDefaultResourceLoader();

  const container = document.getElementById('container') as HTMLElement;
  const infographicOptions = createInfographicOptions(input, options);

  return new Promise((resolve, reject) => {
    try {
      const infographic = new Infographic({
        ...infographicOptions,
        container,
      });

      infographic.on('error', (error: Error) => {
        reject(error);
      });

      infographic.on('rendered', async ({ node }: { node: SVGSVGElement }) => {
        try {
          await waitForIconsAndEmbed(node);
          cleanupSVG(node);
          resolve(node);
        } catch (err) {
          reject(err);
        }
      });

      infographic.render();
    } catch (error) {
      reject(error);
    }
  });
}

function svgToString(svg: SVGSVGElement, options?: RenderOptions): string {
  let svgString = (svg as any).outerHTML || svg.toString();

  if (options?.optimize) {
    svgString = optimizeSVG(svgString, options.svgoConfig);
  }

  return svgString;
}

export async function renderToSVGString(
  input: Input,
  options?: RenderOptions
): Promise<string> {
  const svg = await renderToSVG(input, options);
  return svgToString(svg, options);
}

export async function renderWithResult(
  input: Input,
  options?: RenderOptions
): Promise<SSRRenderResult> {
  const errors: SSRError[] = [];
  const warnings: SSRError[] = [];

  if (typeof input === 'string') {
    const { errors: parseErrors, warnings: parseWarnings } = parseSyntax(input);

    errors.push(...(parseErrors as SSRError[]));
    warnings.push(...(parseWarnings as SSRError[]));

    if (parseErrors.length > 0) {
      return { svg: '', errors, warnings };
    }
  }

  try {
    const svg = await renderToSVG(input, options);
    return { svg: svgToString(svg, options), errors, warnings };
  } catch (error) {
    errors.push({
      code: 'render_error',
      message: error instanceof Error ? error.message : 'Unknown render error',
      path: '',
      line: 0,
    });
    return { svg: '', errors, warnings };
  }
}
