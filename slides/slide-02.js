// Slide 02: Table of Contents
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // 顶部标题区
  slide.addText('CONTENTS', {
    x: 0.6, y: 0.5, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });
  slide.addText('\u76ee   \u5f55', {
    x: 0.6, y: 0.9, w: 4.0, h: 0.7,
    fontSize: 38, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  // 装饰线
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.7, w: 1.5, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  // 六个目录项(两列)
  const items = [
    { n: '01', t: '\u4f5c\u54c1\u6982\u8ff0',     d: 'Background & Positioning' },
    { n: '02', t: '\u7cfb\u7edf\u67b6\u6784',     d: 'System Architecture' },
    { n: '03', t: '\u6838\u5fc3\u6280\u672f',     d: 'Core Algorithms' },
    { n: '04', t: '\u521b\u4f5c\u8fc7\u7a0b',     d: 'Creative Process' },
    { n: '05', t: '\u4f5c\u54c1\u7279\u8272',     d: 'Innovation Highlights' },
    { n: '06', t: '\u603b\u7ed3\u4e0e\u5c55\u671b', d: 'Summary & Outlook' }
  ];

  const startX = 0.6;
  const startY = 2.0;
  const cardW = 4.4;
  const cardH = 1.05;
  const gapX = 0.3;
  const gapY = 0.2;

  for (let i = 0; i < items.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // 卡片背景
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: cardW, h: cardH,
      fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
      rectRadius: 0.05
    });
    // 左侧深蓝竖条
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: 0.1, h: cardH,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });

    // 编号(大号)
    slide.addText(items[i].n, {
      x: x + 0.25, y: y + 0.1, w: 0.85, h: 0.85,
      fontSize: 42, fontFace: 'Arial', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });

    // 中文标题
    slide.addText(items[i].t, {
      x: x + 1.15, y: y + 0.15, w: cardW - 1.25, h: 0.45,
      fontSize: 18, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });

    // 英文副标
    slide.addText(items[i].d, {
      x: x + 1.15, y: y + 0.6, w: cardW - 1.25, h: 0.35,
      fontSize: 11, fontFace: 'Arial', color: theme.secondary,
      italic: true, align: 'left', valign: 'middle', margin: 0
    });
  }

  // 页码
  slide.addText('02', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };