import * as fs from 'fs';
import * as path from 'path';

export async function readInput(inputPath: string): Promise<string> {
  if (inputPath === '-') {
    return readStdin();
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf-8');
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => {
      if (!data) {
        reject(new Error('Timeout reading from stdin'));
      }
    }, 30000);
  });
}

export function writeOutput(outputPath: string | undefined, content: string): void {
  if (!outputPath) {
    process.stdout.write(content);
    return;
  }

  const absolutePath = path.resolve(process.cwd(), outputPath);
  const dir = path.dirname(absolutePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(absolutePath, content, 'utf-8');
}

export function loadSvgoConfig(configPath: string): any {
  const absolutePath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`SVGO config file not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath);
  if (ext === '.json') {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  }

  return require(absolutePath);
}

export function parseInputContent(content: string): any {
  const trimmed = content.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
