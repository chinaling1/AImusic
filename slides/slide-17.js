// Slide 17: Closing - 致谢 / Q&A
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // 左侧大块深蓝
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 4.5, h: 5.625,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });

  // 左侧主标题
  slide.addText('THANK', {
    x: 0.5, y: 1.2, w: 4.0, h: 1.2,
    fontSize: 72, fontFace: 'Arial', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });
  slide.addText('YOU', {
    x: 0.5, y: 2.3, w: 4.0, h: 1.2,
    fontSize: 72, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });
  // 装饰线
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.55, w: 1.2, h: 0,
    line: { color: theme.light, width: 2 }
  });
  slide.addText('Q & A', {
    x: 0.5, y: 3.7, w: 4.0, h: 0.4,
    fontSize: 16, fontFace: 'Arial', color: theme.light,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 6
  });

  // 右侧致谢与元数据
  slide.addText('\u81f4\u8c22', {
    x: 5.0, y: 0.6, w: 4.5, h: 0.5,
    fontSize: 22, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addShape(pres.shapes.LINE, {
    x: 5.0, y: 1.1, w: 1.0, h: 0,
    line: { color: theme.accent, width: 1.5 }
  });

  const credits = [
    { t: '\u8d5b\u4e8b\u7ec4\u59d4\u4f1a', d: '\u63d0\u4f9b\u516c\u5e73\u3001\u900f\u660e\u7684\u8bc4\u5ba1\u673a\u5236' },
    { t: 'DeepSeek / MiniMax', d: '\u63d0\u4f9b\u6587\u672c\u4e0e\u97f3\u9891\u751f\u6210\u80fd\u529b' },
    { t: '\u5f00\u6e90\u793e\u533a', d: 'React / Vite / FastAPI / music21 / electron-builder' },
    { t: '\u6307\u5bfc\u8001\u5e08', d: '\u5728\u8d5b\u9053\u9009\u62e9\u4e0e\u7b97\u6cd5\u8def\u7ebf\u4e0a\u7684\u6307\u5bfc' }
  ];
  let cy = 1.35;
  for (const c of credits) {
    slide.addText(c.t, {
      x: 5.0, y: cy, w: 4.5, h: 0.32,
      fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(c.d, {
      x: 5.0, y: cy + 0.32, w: 4.5, h: 0.28,
      fontSize: 10, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'middle', margin: 0
    });
    cy += 0.65;
  }

  // 底部作品信息条
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 4.55, w: 4.5, h: 0.7,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.05
  });
  slide.addText('\u300a\u4e45\u522b04\u300d', {
    x: 5.15, y: 4.6, w: 1.5, h: 0.6,
    fontSize: 18, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addShape(pres.shapes.LINE, {
    x: 6.55, y: 4.7, w: 0, h: 0.4,
    line: { color: theme.secondary, width: 0.5 }
  });
  slide.addText('\u53e4\u97f5 AI  \u00b7  AI \u97f3\u4e50\u8d5b\u9053', {
    x: 6.7, y: 4.6, w: 2.7, h: 0.6,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.primary,
    align: 'left', valign: 'middle', margin: 0
  });

  // 页码
  slide.addText('17', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };