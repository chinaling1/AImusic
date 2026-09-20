// Slide 07: Content - 古韵AI 三层 + 数据层
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('02  /  ' + '\u7cfb\u7edf\u67b6\u6784', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u53e4\u97f5 AI \u7cfb\u7edf\u67b6\u6784', {
    x: 0.5, y: 0.7, w: 7.5, h: 0.65,
    fontSize: 30, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('Three layers from user intent to MiniMax-ready prompt package', {
    x: 0.5, y: 1.3, w: 9.0, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0
  });

  // 3 layered cards (presentation / api-service / data)
  const layers = [
    {
      n: '01', title: '\u8868\u73b0\u5c42', sub: 'Presentation',
      desc: 'React + Vite + Electron \u684c\u9762\u5e94\u7528\uff1b\u4e09\u6b65\u5de5\u4f5c\u6d41\uff08\u63d0\u793a\u8bcd \u2192 \u6b4c\u8bcd \u2192 \u683c\u5f0f\u6821\u9a8c\uff09\u4e0e\u63d0\u793a\u8bcd\u7248\u672c\u7ed3\u6784\u5316\u7ba1\u7406\uff1b\u53e4\u98ce UI \u4e0e\u590d\u5236\u4e00\u952e\u6253\u5f00 MiniMax',
      tech: 'React 19  \u00b7  Vite 8  \u00b7  Tailwind 4  \u00b7  Electron 33'
    },
    {
      n: '02', title: '\u63a5\u53e3 + \u670d\u52a1\u5c42', sub: 'API + Service',
      desc: 'FastAPI REST \u8def\u7531\uff1a\u63d0\u793a\u8bcd\u4f18\u5316 / \u6b4c\u8bcd\u751f\u6210 / MiniMax \u683c\u5f0f\u6821\u9a8c / \u5bc6\u94a5\u7ba1\u7406\uff1b\u63d0\u793a\u8bcd\u5e93\u96c6\u4e2d\u7ba1\u7406\uff1b\u5f02\u5e38\u8f6c\u8bd1 + finish_reason \u68c0\u67e5\u9632\u6b62\u88ab\u622a\u65ad\u7684\u534a\u622a\u5185\u5bb9\u5165\u5e93',
      tech: 'FastAPI  \u00b7  Pydantic  \u00b7  OpenAI SDK  \u00b7  asyncio'
    },
    {
      n: '03', title: '\u6570\u636e\u5c42', sub: 'Data',
      desc: 'SQLite \u6301\u4e7f\u5316\u63d0\u793a\u8bcd\u7248\u672c\u53ca\u4eba\u5de5\u4fee\u8ba2\u8bb0\u5f55\uff1b\u672c\u5730\u5bc6\u94a5\u6587\u4ef6\uff08.gitignore \u5df2\u8986\u76d6\uff09\u6301\u4e7f\u5316\u8bbe\u7f6e\u9762\u677f\u8f93\u5165\u7684 API Key\uff1b\u672c\u5de5\u5177\u4e0d\u6d89\u53ca\u97f3\u9891\u6e32\u67d3',
      tech: 'aiosqlite  \u00b7  JSON  \u00b7  .secrets.json'
    }
  ];

  const startX = 0.5;
  const startY = 1.7;
  const cardW = 2.95;
  const cardH = 3.0;
  const gap = 0.13;

  for (let i = 0; i < layers.length; i++) {
    const x = startX + i * (cardW + gap);
    const L = layers[i];

    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: startY, w: cardW, h: cardH,
      fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: startY, w: cardW, h: 0.6,
      fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
    });
    slide.addText(L.n, {
      x: x + 0.15, y: startY + 0.05, w: 0.5, h: 0.5,
      fontSize: 20, fontFace: 'Arial', color: theme.light,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(L.sub, {
      x: x + 0.65, y: startY + 0.05, w: cardW - 0.7, h: 0.5,
      fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
      italic: true, align: 'right', valign: 'middle', margin: 0, charSpacing: 2
    });

    slide.addText(L.title, {
      x: x + 0.15, y: startY + 0.75, w: cardW - 0.3, h: 0.4,
      fontSize: 18, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });

    slide.addText(L.desc, {
      x: x + 0.15, y: startY + 1.2, w: cardW - 0.3, h: 1.2,
      fontSize: 10, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'top', margin: 0
    });

    slide.addShape(pres.shapes.LINE, {
      x: x + 0.15, y: startY + 2.45, w: cardW - 0.3, h: 0,
      line: { color: theme.accent, width: 0.8 }
    });
    slide.addText(L.tech, {
      x: x + 0.15, y: startY + 2.55, w: cardW - 0.3, h: 0.4,
      fontSize: 9, fontFace: 'Arial', color: theme.secondary,
      italic: true, align: 'left', valign: 'top', margin: 0
    });
  }

  // Boundary statement
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.0, w: 9.0, h: 0.35,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    rectRadius: 0.04
  });
  slide.addText('\u4eba\u7684\u521b\u4f5c\u610f\u56fe  \u2192  \u672c\u5730\u63d0\u793a\u8bcd\u5de5\u5177  \u2192  MiniMax \u97f3\u4e50\u7f51\u9875\u7248\u751f\u6210\u3002\u672c\u5de5\u5177\u4ec5\u8d1f\u8d23\u63d0\u793a\u8bcd\u4e0e\u683c\u5f0f\u6821\u9a8c\uff0c\u4e0d\u6d89\u53ca\u97f3\u9891\u6e32\u67d3\u4e0e\u6df7\u97f3\u6b65\u9aa4', {
    x: 0.5, y: 5.0, w: 9.0, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    align: 'center', valign: 'middle', margin: 0
  });

  slide.addText('07', {
    x: 9.3, y: 4.65, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };