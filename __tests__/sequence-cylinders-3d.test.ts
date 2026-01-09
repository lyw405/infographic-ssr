import { describe, it, expect, beforeAll } from 'vitest';
import { renderToSVGString, initGlobalEnv } from '../src';
import { writeFileSync } from 'fs';

describe('sequence-cylinders-3d-simple', () => {
  beforeAll(() => {
    initGlobalEnv();
  });

  it('should render sequence-cylinders-3d-simple with enterprise data', async () => {
    const svg = await renderToSVGString(
      [
        {
          label: '品牌影响力',
          value: 85,
          desc: '在目标用户群中具备较强认知与信任度',
          time: '2021',
          icon: 'mingcute/diamond-2-fill',
          illus: 'creative-experiment',
        },
        {
          label: '技术研发力',
          value: 90,
          desc: '拥有自研核心系统与持续创新能力',
          time: '2022',
          icon: 'mingcute/code-fill',
          illus: 'code-thinking',
        },
        {
          label: '市场增长快',
          value: 78,
          desc: '近一年用户规模实现快速增长',
          time: '2023',
          icon: 'mingcute/wallet-4-line',
          illus: 'business-analytics',
        },
        {
          label: '服务满意度',
          value: 88,
          desc: '用户对服务体系整体评分较高',
          time: '2020',
          icon: 'mingcute/happy-line',
          illus: 'feeling-happy',
        },
        {
          label: '数据资产全',
          value: 92,
          desc: '构建了完整用户标签与画像体系',
          time: '2022',
          icon: 'mingcute/user-4-line',
          illus: 'mobile-photos',
        },
        {
          label: '创新能力强',
          value: 83,
          desc: '新产品上线频率高于行业平均',
          time: '2023',
          icon: 'mingcute/rocket-line',
          illus: 'creativity',
        },
      ],
      {
        template: 'sequence-cylinders-3d-simple',
        data: {
          title: '企业优势列表',
          desc: '展示企业在不同维度上的核心优势与表现值',
        },
        theme: {
          type: 'light',
          palette: 'antv',
        },
        design: {
          items: [{ type: 'simple', showIcon: true, usePaletteColor: true }],
        },
        padding: 40,
      }
    );

    writeFileSync('/Users/liuyuwang/Desktop/openSource/aaa/infographic-ssr/__tests__/output.svg', svg);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });
});
