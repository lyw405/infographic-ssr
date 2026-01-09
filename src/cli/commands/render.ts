import { Command } from 'commander';
import { renderToSVGString } from '../../render';
import type { RenderOptions } from '../../types';
import { loadSvgoConfig, parseInputContent, readInput, writeOutput } from '../utils';

interface RenderCommandOptions {
  input: string;
  output?: string;
  optimize?: boolean;
  svgoConfig?: string;
  structure?: string;
  theme?: string;
}

export const renderCommand = new Command('render')
  .description('Render infographic to SVG')
  .requiredOption('-i, --input <path>', 'Input file path (use "-" for stdin)')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .option('--optimize', 'Optimize SVG output with svgo')
  .option('--svgo-config <path>', 'Path to svgo config file')
  .option('-s, --structure <name>', 'Structure type')
  .option('-t, --theme <name>', 'Theme name')
  .action(async (opts: RenderCommandOptions) => {
    try {
      const inputContent = await readInput(opts.input);
      const parsedInput = parseInputContent(inputContent);

      const renderOptions: RenderOptions = {
        optimize: opts.optimize,
      };

      if (opts.svgoConfig) {
        renderOptions.svgoConfig = loadSvgoConfig(opts.svgoConfig);
      }

      if (opts.structure) {
        (renderOptions as any).structure = opts.structure;
      }

      if (opts.theme) {
        (renderOptions as any).theme = opts.theme;
      }

      let input: any;
      if (typeof parsedInput === 'object' && parsedInput !== null) {
        if ('data' in parsedInput) {
          input = parsedInput.data;
          Object.assign(renderOptions, parsedInput);
          delete (renderOptions as any).data;
        } else if (Array.isArray(parsedInput)) {
          input = parsedInput;
        } else {
          input = parsedInput;
        }
      } else {
        input = parsedInput;
      }

      const svg = await renderToSVGString(input, renderOptions);
      writeOutput(opts.output, svg);

      if (opts.output) {
        console.error(`✓ SVG written to ${opts.output}`);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });
