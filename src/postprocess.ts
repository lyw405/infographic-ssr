export function embedIconsToSVG(svg: SVGSVGElement): void {
  const uses = svg.querySelectorAll('use');
  let defs = svg.querySelector('defs');

  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.prepend(defs);
  }

  const addedIds = new Set<string>();

  uses.forEach((use) => {
    const href = use.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const id = href.slice(1);
    if (addedIds.has(id)) return;

    const existsInSvg = svg.querySelector(href);
    if (existsInSvg) return;

    const symbolElement = document.querySelector(href);
    if (symbolElement) {
      defs!.appendChild(symbolElement.cloneNode(true));
      addedIds.add(id);
    }
  });
}

export async function waitForIconsAndEmbed(svg: SVGSVGElement, maxWait = 5000, interval = 100): Promise<void> {
  const uses = svg.querySelectorAll('use');
  if (uses.length === 0) return;

  const requiredIds = new Set<string>();
  uses.forEach((use) => {
    const href = use.getAttribute('href');
    if (href && href.startsWith('#')) {
      requiredIds.add(href);
    }
  });

  if (requiredIds.size === 0) return;

  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    let allFound = true;
    for (const href of requiredIds) {
      const symbolElement = document.querySelector(href);
      if (!symbolElement) {
        allFound = false;
        break;
      }
    }

    if (allFound) {
      embedIconsToSVG(svg);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  embedIconsToSVG(svg);
}

export function cleanupSVG(svg: SVGSVGElement): void {
  const groups = svg.querySelectorAll('g');
  groups.forEach((group) => {
    group.removeAttribute('x');
    group.removeAttribute('y');
    group.removeAttribute('width');
    group.removeAttribute('height');
  });

  const transientContainer = svg.querySelector('[data-element-type=transient-container]');
  transientContainer?.remove();

  const btnsGroup = svg.querySelector('[data-element-type=btns-group]');
  btnsGroup?.remove();

  recalculateViewBox(svg);
}

function recalculateViewBox(svg: SVGSVGElement): void {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const processElement = (el: Element, parentTranslateX = 0, parentTranslateY = 0) => {
    let translateX = parentTranslateX;
    let translateY = parentTranslateY;

    const transform = el.getAttribute('transform');
    if (transform) {
      const translateMatch = transform.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
      if (translateMatch) {
        translateX += parseFloat(translateMatch[1]);
        translateY += parseFloat(translateMatch[2]);
      }
    }

    const tagName = el.tagName.toLowerCase();

    if (tagName === 'rect' || tagName === 'foreignobject') {
      const x = parseFloat(el.getAttribute('x') || '0') + translateX;
      const y = parseFloat(el.getAttribute('y') || '0') + translateY;
      const width = parseFloat(el.getAttribute('width') || '0');
      const height = parseFloat(el.getAttribute('height') || '0');
      if (width > 0 && height > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      }
    } else if (tagName === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '0') + translateX;
      const cy = parseFloat(el.getAttribute('cy') || '0') + translateY;
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      minX = Math.min(minX, cx - rx);
      minY = Math.min(minY, cy - ry);
      maxX = Math.max(maxX, cx + rx);
      maxY = Math.max(maxY, cy + ry);
    } else if (tagName === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0') + translateX;
      const cy = parseFloat(el.getAttribute('cy') || '0') + translateY;
      const r = parseFloat(el.getAttribute('r') || '0');
      minX = Math.min(minX, cx - r);
      minY = Math.min(minY, cy - r);
      maxX = Math.max(maxX, cx + r);
      maxY = Math.max(maxY, cy + r);
    } else if (tagName === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0') + translateX;
      const y1 = parseFloat(el.getAttribute('y1') || '0') + translateY;
      const x2 = parseFloat(el.getAttribute('x2') || '0') + translateX;
      const y2 = parseFloat(el.getAttribute('y2') || '0') + translateY;
      minX = Math.min(minX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxX = Math.max(maxX, x1, x2);
      maxY = Math.max(maxY, y1, y2);
    } else if (tagName === 'path') {
      const d = el.getAttribute('d') || '';
      const coords = extractPathBounds(d);
      if (coords) {
        minX = Math.min(minX, coords.minX + translateX);
        minY = Math.min(minY, coords.minY + translateY);
        maxX = Math.max(maxX, coords.maxX + translateX);
        maxY = Math.max(maxY, coords.maxY + translateY);
      }
    }

    for (const child of el.children) {
      processElement(child, translateX, translateY);
    }
  };

  for (const child of svg.children) {
    if (child.tagName.toLowerCase() !== 'defs') {
      processElement(child);
    }
  }

  if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
    const currentViewBox = svg.getAttribute('viewBox');
    let padding = 20;
    if (currentViewBox) {
      const parts = currentViewBox.split(/\s+/).map(Number);
      if (parts.length === 4) {
        const currentMinX = parts[0];
        padding = Math.abs(currentMinX);
      }
    }

    const newViewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
    svg.setAttribute('viewBox', newViewBox);
  }
}

function extractPathBounds(d: string): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const numbers = d.match(/[-+]?\d*\.?\d+/g);
  if (!numbers || numbers.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = parseFloat(numbers[i]);
    const y = parseFloat(numbers[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY };
}
