// Slide 04: Content - 赛道背景与三大痛点
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Top heading
  slide.addText('01  /  ' + '\u4f5c\u54c1\u6982\u8ff0', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u8d5b\u9053\u80cc\u666f\u4e0e\u73b0\u72b6\u75db\u70b9', {
    x: 0.5, y: 0.7, w: 7.5, h: 0.65,
    fontSize: 30, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // Left card: Track Trend
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 4.4, h: 3.3,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 0.1, h: 3.3,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('\u8d5b\u9053\u8d8b\u52bf', {
    x: 0.8, y: 1.7, w: 3.9, h: 0.4,
    fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('TREND', {
    x: 0.8, y: 2.1, w: 3.9, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  const trendPoints = [
    { k: '2026', v: '\u8d5b\u9053\u4ece\u300c\u533a\u5757\u94fe+\u97f3\u4e50\u300d\u8f6c\u4e3a\u300c\u4eba\u5de5\u667a\u80fd+\u97f3\u4e50\u300d' },
    { k: '65%',  v: '\u6280\u672f\u4e0e\u521b\u4f5c\u6280\u80fd\u5360\u6bd4\uff0c\u6587\u6863+\u7b54\u8fa9\u53e6\u5360 25%' },
    { k: 'V2.3', v: '\u4ea7\u54c1\u91cd\u5b9a\u4f4d\uff1a\u4ee5\u300c\u63d0\u793a\u8bcd\u5de5\u7a0b + \u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c\u300d\u4e3a\u6280\u672f\u4e3b\u8d74' }
  ];
  let py = 2.5;
  for (const p of trendPoints) {
    slide.addText(p.k, {
      x: 0.8, y: py, w: 0.9, h: 0.4,
      fontSize: 22, fontFace: 'Arial', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(p.v, {
      x: 1.75, y: py, w: 3.05, h: 0.7,
      fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'middle', margin: 0
    });
    py += 0.78;
  }

  // Right card: Three real pain points
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 4.4, h: 3.3,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 0.1, h: 3.3,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText('\u73b0\u72b6\u4e09\u5927\u75db\u70b9', {
    x: 5.4, y: 1.7, w: 4.0, h: 0.4,
    fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('CURRENT PAIN POINTS', {
    x: 5.4, y: 2.1, w: 4.0, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  const painPoints = [
    { n: '01', t: '\u5546\u4e1a\u97f3\u9891\u751f\u6210\u63a5\u53e3\u4e0d\u900f\u660e', d: 'MiniMax Audio \u7f51\u9875\u7248\u3001Suno \u3001Udio \u7b49\u4e3a\u4ec5\u6709\u5165\u53e3\uff0c\u63d0\u793a\u8bcd\u4e0e\u8f93\u51fa\u9700\u624b\u52a8\u62f7\u8d2d\uff0c\u4e0d\u53ef\u7a0b\u5e8f\u5316\u9a8c\u8bc1' },
    { n: '02', t: '\u4eba\u5de5\u5e72\u9884\u96be\u4ee5\u8bc9\u8bc1', d: 'AI \u7aef\u5230\u7aef\u751f\u6210\u8def\u5f84\u4e2d\uff0c\u7528\u6237\u7f16\u8f91\u4e0e\u9009\u62e9\u8bb0\u5f55\u7f3a\u5931\uff0c\u300c\u4eba\u5de5\u5e72\u9884\u5145\u5206\u300d\u96be\u4ee5\u8bc9\u8bc1' },
    { n: '03', t: 'LLM \u8f93\u51fa\u4e0d\u53ef\u63a7', d: '\u6df1\u5ea6\u8bed\u8a00\u63cf\u8ff0\u201c\u53e4\u7b5d\u201d\u201c\u4e94\u58f0\u201d\u201c\u62fc\u97f3\u201d\u7b49\u4e13\u4e1a\u672f\u8bed\u65f6\uff0c\u5927\u6a21\u578b\u8f93\u51fa\u53ef\u80fd\u8d8a\u754c\u6216\u5e72\u51b2\u76f4\u63a5\u751f\u6210' }
  ];
  py = 2.5;
  for (const p of painPoints) {
    slide.addText(p.n, {
      x: 5.4, y: py, w: 0.55, h: 0.4,
      fontSize: 18, fontFace: 'Arial', color: theme.accent,
      bold: true, align: 'left', valign: 'top', margin: 0
    });
    slide.addText(p.t, {
      x: 5.95, y: py, w: 3.45, h: 0.32,
      fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'left', valign: 'top', margin: 0
    });
    slide.addText(p.d, {
      x: 5.95, y: py + 0.32, w: 3.45, h: 0.45,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.secondary,
      align: 'left', valign: 'top', margin: 0
    });
    py += 0.78;
  }

  // Bottom solution strip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('\u672c\u4f5c\u54c1\u91c7\u300c\u63d0\u793a\u8bcd\u5de5\u7a0b + \u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c + \u7248\u672c\u5168\u94fe\u8def\u53ef\u5ba1\u8ba1\u300d\u8def\u5f84\uff0c\u8d4b\u4e88\u4f5c\u54c1\u300c\u63d0\u793a\u8bcd\u4e0a\u53ef\u63a7\u3001\u8f93\u51fa\u4e0a\u53ef\u9a8c\u3001\u8fc7\u7a0b\u4e0a\u53ef\u8bc9\u8bc1\u300d\u4e09\u9879\u80fd\u529b', {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    align: 'center', valign: 'middle', margin: 0
  });

  slide.addText('04', {
    x: 9.3, y: 4.7, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };