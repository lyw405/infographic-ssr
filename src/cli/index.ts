#!/usr/bin/env node
import { program } from 'commander';
import { renderCommand } from './commands/render';

program
  .name('infographic-ssr')
  .description('Server-side rendering CLI for @antv/infographic')
  .version('0.2.0');

program.addCommand(renderCommand);

program.parse();
