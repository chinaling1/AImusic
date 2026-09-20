// Slide 12: Content - 创作过程(按实际范围,不虚构编曲/演奏法/母带)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('04  /  ' + '\u521b\u4f5c\u8fc7\u7a0b', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u4ece\u63d0\u793a\u8bcd\u5de5\u7a0b\u5230\u63d0\u793a\u8bcd\u5305\u00b7\u4e09\u6b65\u4f5c\u4e1a\u6d41\u6c34', {
    x: 0.5, y: 0.7, w: 9.0, h: 0.65,
    fontSize: 28, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // 顶部三阶段标签
  const phases = [
    { d: 'STEP 1',  t: '\u63d0\u793a\u8bcd\u4f18\u5316', c: theme.primary },
    { d: 'STEP 2',  t: '\u6b4c\u8bcd\u751f\u6210', c: theme.accent },
    { d: 'STEP 3',  t: '\u683c\u5f0f\u6821\u9a8c + \u590d\u5236\u4ea4\u4ed8', c: theme.light }
  ];
  let px = 0.5;
  const pW = 2.95;
  const pGap = 0.13;
  for (let i = 0; i < phases.length; i++) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: 1.5, w: pW, h: 0.55,
      fill: { color: phases[i].c }, line: { color: phases[i].c, width: 0 },
      rectRadius: 0.04
    });
    slide.addText(phases[i].d, {
      x: px, y: 1.5, w: 0.85, h: 0.55,
      fontSize: 13, fontFace: 'Arial', color: 'FFFFFF',
      bold: true, align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(phases[i].t, {
      x: px + 0.85, y: 1.5, w: pW - 0.9, h: 0.55,
      fontSize: 13, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
      align: 'left', valign: 'middle', margin: 0
    });
    px += pW + pGap;
  }

  // 中间时间线
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 2.95, w: 8.8, h: 0,
    line: { color: theme.primary, width: 1.5 }
  });

  // 6 个节点 = 三步,每步内部两节点(输入 → 输出 / 校验)
  const nodes = [
    { n: 'S1.1', t: '\u8f93\u5165\u539f\u59cb\u63d0\u793a\u8bcd', c: theme.primary, d: 'STEP 1 \u8f93\u5165' },
    { n: 'S1.2', t: 'DeepSeek Pro \u8f93\u51fa Meta + Styles', c: theme.primary, d: 'STEP 1 \u8f93\u51fa' },
    { n: 'S2.1', t: '\u63d0\u793a\u8bcd\u786e\u8ba4 + \u53e4\u98ce\u53c2\u6570', c: theme.accent, d: 'STEP 2 \u8f93\u5165' },
    { n: 'S2.2', t: 'DeepSeek Pro \u751f\u6210\u6709\u7ed3\u6784\u6807\u7b7e\u7684\u6b4c\u8bcd', c: theme.accent, d: 'STEP 2 \u8f93\u51fa' },
    { n: 'S3.1', t: '\u672c\u5730\u786e\u5b9a\u6027\u6821\u9a8c\uff1a14 \u79cd\u95ee\u9898', c: theme.light, d: 'STEP 3 \u6821\u9a8c' },
    { n: 'S3.2', t: '\u4e00\u952e\u590d\u5236 + \u6253\u5f00 MiniMax \u97f3\u4e50\u7f51\u9875', c: theme.light, d: 'STEP 3 \u4ea4\u4ed8' }
  ];
  const nodeW = 8.8 / 6;
  const nodeY = 2.95;
  for (let i = 0; i < nodes.length; i++) {
    const cx = 0.6 + (i + 0.5) * nodeW;
    slide.addShape(pres.shapes.OVAL, {
      x: cx - 0.13, y: nodeY - 0.13, w: 0.26, h: 0.26,
      fill: { color: nodes[i].c }, line: { color: 'FFFFFF', width: 1.5 }
    });
    slide.addText(nodes[i].n, {
      x: cx - 0.55, y: nodeY + 0.2, w: 1.1, h: 0.3,
      fontSize: 10, fontFace: 'Arial', color: nodes[i].c,
      bold: true, align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(nodes[i].t, {
      x: cx - nodeW/2 + 0.05, y: nodeY + 0.55, w: nodeW - 0.1, h: 0.85,
      fontSize: 9, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'center', valign: 'top', margin: 0
    });
  }

  // 底部步骤说明(左:输入处理;右:可证性)
  // Left card
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.4, w: 4.4, h: 0.55,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.04
  });
  slide.addText('\u4eba\u5de5\u5e72\u9884\u8bc1\u636e', {
    x: 0.65, y: 4.4, w: 1.4, h: 0.55,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('\u63d0\u793a\u8bcd/\u6b4c\u8bcd\u6bcf\u4f8b original \u00b7 ai_optimized \u00b7 human_modified \u5168\u90e8\u5165\u5e93', {
    x: 1.85, y: 4.4, w: 3.0, h: 0.55,
    fontSize: 9, fontFace: 'Microsoft YaHei', color: theme.primary,
    align: 'left', valign: 'middle', margin: 0
  });

  // Right card
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 4.4, w: 4.4, h: 0.55,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.04
  });
  slide.addText('\u4ea4\u4ed8\u8def\u5f84', {
    x: 5.25, y: 4.4, w: 1.4, h: 0.55,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('\u63d0\u793a\u8bcd\u5305 \u00b7 \u7c98\u8d34 \u00b7 MiniMax \u7f51\u9875\u751f\u6210 mp3 \u00b7 \u4fdd\u5b58\u63d0\u793a\u8bcd\u5305\u4f5c\u4e3a\u521b\u4f5c\u8fc7\u7a0b\u5b58\u6863', {
    x: 6.4, y: 4.4, w: 3.05, h: 0.55,
    fontSize: 9, fontFace: 'Microsoft YaHei', color: theme.primary,
    align: 'left', valign: 'middle', margin: 0
  });

  // Bottom strip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('\u672c\u4f5c\u54c1\u8303\u56f4\uff1a\u4ec5\u8986\u76d6\u63d0\u793a\u8bcd\u5de5\u7a0b + \u683c\u5f0f\u6821\u9a8c + \u590d\u5236\u4ea4\u4ed8\uff1b\u4e0d\u542b\u97f3\u9891\u6e32\u67d3 / \u7f16\u66f2 / \u6df7\u97f3', {
    x: 0.5, y: 5.05, w: 9.0, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    align: 'center', valign: 'middle', margin: 0
  });

  slide.addText('12', {
    x: 9.3, y: 4.65, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };