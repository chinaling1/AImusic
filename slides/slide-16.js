// Slide 16: Content - 收获与不足(按实际能力)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('06  /  ' + '\u603b\u7ed3\u4e0e\u5c55\u671b', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u521b\u4f5c\u6536\u83b7\u4e0e\u4e0d\u8db3', {
    x: 0.5, y: 0.7, w: 7.5, h: 0.65,
    fontSize: 30, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // Left card: gains
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 4.4, h: 3.3,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 0.1, h: 3.3,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('\u521b\u4f5c\u6536\u83b7', {
    x: 0.75, y: 1.7, w: 4.0, h: 0.4,
    fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('WHAT WE LEARNED', {
    x: 0.75, y: 2.1, w: 4.0, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  const gains = [
    { t: '\u63d0\u793a\u8bcd\u53ef\u7ed3\u6784\u5316\u590d\u7528', d: '\u4e09\u6bb5\u5f0f\u8f93\u51fa\u4f7f Meta + Styles \u4e0e\u6b4c\u8bcd\u53ef\u4e92\u76f8\u53c2\u8003\uff0c\u51cf\u5c11\u91cd\u590d\u8c03\u8bd5' },
    { t: '\u786e\u5b9a\u6027\u6821\u9a8c\u53ef\u72ec\u7acb\u4f5c\u4e3a\u8bc1\u636e', d: '14 \u79cd\u6807\u7b7e\u5408\u6cd5\u6027\u3001\u4e2d\u82f1\u6620\u5c04\u3001\u5b57\u6570\u4e0a\u9650\u90fd\u662f\u53ef\u8d70\u5168\u8def\u5f84\u7684\u51fd\u6570\uff0c\u8f93\u51fa\u62a5\u544a\u53ef\u4f5c\u4e3a\u300c\u8bbe\u8ba1\u8bf4\u660e\u300d\u9644\u4ef6' },
    { t: '\u4eba\u5de5\u5e72\u9884\u53ef\u67e5', d: 'original / ai_optimized / human_modified \u4e09\u7c7b\u8bb0\u5f55\u5168\u90e8\u5165\u5e93\uff0c\u53ef\u6309 session \u67e5\u8be2\u5168\u90e8\u5386\u53f2' },
    { t: '\u63d0\u793a\u8bcd\u5305\u53ef\u76f4\u63a5\u4ea4\u4ed8', d: '\u300c\u590d\u5236 + \u6253\u5f00 MiniMax \u97f3\u4e50\u7f51\u9875\u7248 + \u7c98\u8d34\u300d\u4e09\u6b65\u5b8c\u6210\uff0c\u4ea4\u4ed8\u8def\u5f84\u660e\u786e\u4e14\u53ef\u590d\u73b0' }
  ];
  let gy = 2.5;
  for (const g of gains) {
    slide.addText(g.t, {
      x: 0.75, y: gy, w: 4.0, h: 0.3,
      fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(g.d, {
      x: 0.75, y: gy + 0.3, w: 4.0, h: 0.4,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'top', margin: 0
    });
    gy += 0.6;
  }

  // Right card: limits
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 4.4, h: 3.3,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 0.1, h: 3.3,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText('\u4e0d\u8db3\u4e0e\u6539\u8fdb\u65b9\u5411', {
    x: 5.35, y: 1.7, w: 4.0, h: 0.4,
    fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('LIMITATIONS & NEXT', {
    x: 5.35, y: 2.1, w: 4.0, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  const limits = [
    { t: '\u4e0d\u6d89\u53ca\u97f3\u9891\u6e32\u67d3', d: '\u672c\u5de5\u5177\u4ec5\u751f\u6210\u63d0\u793a\u8bcd\u5305\uff0cmp3 \u9700\u5728 MiniMax \u7f51\u9875\u7248\u624b\u52a8\u751f\u6210\uff0c\u672a\u63a5\u5165\u5e73\u53f0\u63a5\u53e3' },
    { t: '\u4e0d\u542b\u97f3\u4e50\u7406\u8bba\u9879\u68c0\u67e5', d: '\u5f53\u524d\u6821\u9a8c\u5668\u4ec5\u68c0\u67e5\u683c\u5f0f\u5408\u89c4\u6027\uff08\u6807\u7b7e/\u5b57\u6570/\u6ce8\u8bb0/\u5143\u6807\u7b7e\uff09\uff0c\u4e0d\u68c0\u67e5\u97f3\u4e50\u7406\u8bba\u9879' },
    { t: '\u8c03\u8bd5\u8f6e\u6b21\u4f9d\u8d56\u4eba\u5de5', d: '\u4e0d\u542b\u81ea\u52a8\u4fee\u8ba2\u5faa\u73af\uff1b\u6821\u9a8c\u4e0d\u8fc7\u65f6\u9700\u4eba\u5de5\u8c03\u6574\u539f\u59cb\u63d0\u793a\u8bcd\u540e\u91cd\u65b0\u8c03\u7528' },
    { t: '\u8bc1\u636e\u94fe\u5bfc\u51fa\u9700\u5347\u7ea7', d: '\u5f53\u524d\u7248\u672c\u5386\u53f2\u4ec5\u5185\u5b58\uff0c\u672a\u63d0\u4f9b\u300c\u63d0\u793a\u8bcd\u5305 + \u7248\u672c\u5386\u53f2\u300d\u4e00\u952e\u6253\u5305\u4e0b\u8f7d' }
  ];
  let ly = 2.5;
  for (const l of limits) {
    slide.addText(l.t, {
      x: 5.35, y: ly, w: 4.0, h: 0.3,
      fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(l.d, {
      x: 5.35, y: ly + 0.3, w: 4.0, h: 0.4,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'top', margin: 0
    });
    ly += 0.6;
  }

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('\u505a\u900f\u4e09\u6b65\u00b7\u8bc9\u900f\u4e09\u6b65\u00b7\u4ea4\u4ed8\u4e09\u6b65 \u00b7 \u672c\u5de5\u5177\u4ec5\u8d1f\u8d23\u63d0\u793a\u8bcd\u5de5\u7a0b\uff0c\u4e0d\u8c03\u7528\u97f3\u9891\u63a5\u53e3', {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    align: 'center', valign: 'middle', margin: 0
  });

  slide.addText('16', {
    x: 9.3, y: 4.7, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };