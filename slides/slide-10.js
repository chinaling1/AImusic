// Slide 10: Content - AI 工具栈与 AI/人工占比 7:3
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('03  /  ' + '\u6838\u5fc3\u6280\u672f', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('AI \u5de5\u5177\u6808\u4e0e AI/\u4eba\u5de5\u5360\u6bd4 7:3', {
    x: 0.5, y: 0.7, w: 9.0, h: 0.65,
    fontSize: 28, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // Left column: 3 AI tools
  const tools = [
    {
      name: 'DeepSeek Pro',
      ver: 'deepseek-v4-pro',
      role: '\u63d0\u793a\u8bcd\u4f18\u5316 / \u6b4c\u8bcd\u751f\u6210',
      desc: '\u4e2d\u6587\u957f\u6587\u672c\u521b\u4f5c\u4e0e\u7ed3\u6784\u5316\u8f93\u51fa\u573a\u666f\uff1bAI \u4e3b\u5bfc\u4f5c\u54c1\u521b\u4f5c',
      color: theme.primary
    },
    {
      name: 'DeepSeek Flash',
      ver: 'deepseek-v4-flash',
      role: '\u5feb\u901f\u6da6\u8272 / \u5fae\u8c03',
      desc: '\u77ed\u8f93\u51fa\uff0c\u54cd\u5e94\u5feb\uff1b\u63d0\u4f9b\u63d0\u793a\u8bcd\u5fae\u8c03\u4e0e\u8865\u5145\u5efa\u8bae',
      color: theme.accent
    },
    {
      name: 'MiniMax Audio',
      ver: 'Music 3.0 (\u7f51\u9875\u7248)',
      role: '\u6210\u54c1 mp3 \u751f\u6210\uff08\u4eba\u5de5\u8d4b\u80fd\uff09',
      desc: '\u672c\u5de5\u5177\u4e0d\u8c03\u7528\u63a5\u53e3\uff0c\u4ec5\u5728\u63d0\u793a\u8bcd\u5b8c\u6210\u540e\u5f15\u5bfc\u4eba\u5de5\u6253\u5f00\u7f51\u9875\u751f\u6210',
      color: theme.light
    }
  ];
  const colW = 4.4;
  let cy = 1.55;
  for (const t of tools) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: colW, h: 1.0,
      fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: 0.1, h: 1.0,
      fill: { color: t.color }, line: { color: t.color, width: 0 }
    });
    slide.addText(t.name, {
      x: 0.75, y: cy + 0.06, w: 2.5, h: 0.3,
      fontSize: 13, fontFace: 'Arial', color: theme.primary,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(t.ver, {
      x: 3.0, y: cy + 0.06, w: 1.85, h: 0.3,
      fontSize: 9, fontFace: 'Arial', color: t.color,
      italic: true, align: 'right', valign: 'middle', margin: 0
    });
    slide.addText(t.role, {
      x: 0.75, y: cy + 0.38, w: 4.0, h: 0.28,
      fontSize: 11, fontFace: 'Microsoft YaHei', color: t.color,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(t.desc, {
      x: 0.75, y: cy + 0.66, w: 4.0, h: 0.32,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.secondary,
      align: 'left', valign: 'top', margin: 0
    });
    cy += 1.05;
  }

  // Right card: AI / Human share 7:3
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 4.4, h: 3.45,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addText('AI / \u4eba\u5de5\u5360\u6bd4', {
    x: 5.3, y: 1.65, w: 4.0, h: 0.32,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('AI Direct Generation Share = 7:3', {
    x: 5.3, y: 1.95, w: 4.0, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 2
  });

  // Donut chart
  slide.addChart(pres.charts.DOUGHNUT, [{
    name: 'AI Share',
    labels: ['AI Direct', 'Human Curation'],
    values: [70, 30]
  }], {
    x: 5.2, y: 2.2, w: 2.4, h: 2.6,
    chartColors: [theme.accent, theme.primary],
    chartArea: { fill: { color: 'FFFFFF' } },
    showLegend: false,
    showPercent: false,
    holeSize: 55
  });
  // Center number
  slide.addText('70%', {
    x: 5.5, y: 3.25, w: 1.8, h: 0.5,
    fontSize: 28, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });
  slide.addText('AI \u76f4\u63a5\u751f\u6210', {
    x: 5.5, y: 3.75, w: 1.8, h: 0.3,
    fontSize: 9, fontFace: 'Microsoft YaHei', color: theme.secondary,
    align: 'center', valign: 'middle', margin: 0
  });

  // Right description
  const stats = [
    { k: '70%', v: 'AI \u76f4\u63a5\u751f\u6210\uff1aDeepSeek Pro \u63d0\u793a\u8bcd + \u6b4c\u8bcd', color: theme.accent },
    { k: '30%', v: '\u4eba\u5de5\u5e72\u9884\uff1a\u539f\u59cb\u63d0\u793a\u8bcd + \u9009\u62e9/\u4fee\u8ba2', color: theme.primary }
  ];
  let sy = 2.4;
  for (const s of stats) {
    slide.addText(s.k, {
      x: 7.85, y: sy, w: 1.0, h: 0.45,
      fontSize: 26, fontFace: 'Arial', color: s.color,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(s.v, {
      x: 7.85, y: sy + 0.5, w: 1.55, h: 0.6,
      fontSize: 9, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'top', margin: 0
    });
    sy += 1.2;
  }

  slide.addText('10', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };