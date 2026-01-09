# infographic-ssr

Server-side rendering for [@antv/infographic](https://github.com/antvis/Infographic).

## Installation



## Usage

### Programmatic API

```typescript
import { renderToSVGString } from 'infographic-ssr';
import { writeFileSync } from 'fs';

// Render from data array (uses default template)
const svg1 = await renderToSVGString([
  { label: 'Step 1', value: 10 },
  { label: 'Step 2', value: 20 },
]);

// Render with specific template
const svg2 = await renderToSVGString(
  [
    { label: 'Item A', value: 10 },
    { label: 'Item B', value: 20 },
  ],
  {
    template: 'list-grid-simple',
    theme: 'light',
  }
);

// With SVG optimization
const svg3 = await renderToSVGString(
  [{ label: 'A' }, { label: 'B' }],
  {
    template: 'sequence-steps-simple',
    optimize: true,
  }
);

// Write to file
writeFileSync('output.svg', svg3);
```

### Render from Syntax String

```typescript
import { renderToSVGString } from 'infographic-ssr';

const svg = await renderToSVGString(`
template: list-grid-simple
data:
  items:
    - label: Item 1
    - label: Item 2
    - label: Item 3
`);
```

### CLI

```bash
# Render from JSON file
infographic-ssr render -i config.json -o output.svg

# Render from stdin
echo '{"data":{"items":[{"label":"A"},{"label":"B"}]},"template":"list-grid-simple"}' | infographic-ssr render -i - -o output.svg

# With optimization
infographic-ssr render -i config.json -o output.svg --optimize

# Custom svgo config
infographic-ssr render -i config.json -o output.svg --optimize --svgo-config svgo.config.js

# Output to stdout
infographic-ssr render -i config.json
```

### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input <path>` | `-i` | Input file path (`-` for stdin) | Required |
| `--output <path>` | `-o` | Output file path | stdout |
| `--optimize` | | Enable svgo optimization | false |
| `--svgo-config <path>` | | Path to svgo config file | Built-in |
| `--structure <name>` | `-s` | Structure type | auto |
| `--theme <name>` | `-t` | Theme name | default |

## API Reference

### `renderToSVGString(input, options?)`

Renders an infographic to an SVG string.

**Parameters:**

- `input`: `string | ItemDatum[]` - Syntax string or data array
- `options`: `RenderOptions` - Optional render options

**Returns:** `Promise<string>` - SVG string

### `renderToSVG(input, options?)`

Renders an infographic to an SVG element.

**Parameters:**

- `input`: `string | ItemDatum[]` - Syntax string or data array
- `options`: `RenderOptions` - Optional render options

**Returns:** `Promise<SVGSVGElement>` - SVG element (linkedom node)

### `RenderOptions`

```typescript
interface RenderOptions {
  template?: string;        // Template name (e.g., 'list-grid-simple')
  structure?: string;       // Structure type
  theme?: string;           // Theme name
  width?: number | string;
  height?: number | string;
  optimize?: boolean;       // Enable svgo optimization
  svgoConfig?: SvgoConfig;  // Custom svgo configuration
  // ... other InfographicOptions
}
```

## Available Templates

The package supports all templates from `@antv/infographic`. Common ones include:

- `list-grid-simple` - Simple grid layout (default)
- `list-row-simple-horizontal-arrow` - Horizontal arrow flow
- `sequence-steps-simple` - Step sequence
- `sequence-timeline-simple` - Timeline
- `hierarchy-tree-*` - Tree structures
- `chart-pie-*` - Pie charts

See the [Infographic documentation](https://github.com/antvis/Infographic) for the full list.

## License

MIT
