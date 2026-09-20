// Slide 09: Content - 核心技术:结构化提示词生成 + 确定性格式校验
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('03  /  ' + '\u6838\u5fc3\u6280\u672f', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u63d0\u793a\u8bcd\u7ed3\u6784\u5316\u751f\u6210 + \u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c', {
    x: 0.5, y: 0.7, w: 9.0, h: 0.65,
    fontSize: 28, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // Top pipeline (linear)
  const steps = [
    { n: '1', t: 'DeepSeek Pro \u4f18\u5316', d: '\u539f\u59cb\u63d0\u793a\u8bcd \u2192 Meta + Styles' },
    { n: '2', t: '\u786e\u5b9a\u6027\u6821\u9a8c', d: '14 \u79cd\u6807\u7b7e / \u5b57\u6570 / \u6ce8\u8bb0 / \u5143\u6807\u7b7e\u516d\u9879' },
    { n: '3', t: '\u4eba\u5de5\u4fee\u8ba2', d: 'original / ai_optimized / human_modified' },
    { n: '4', t: '\u590d\u5236\u63d0\u793a\u8bcd\u5305', d: '\u4e00\u952e\u7c98\u8d34\u5230 MiniMax \u7f51\u9875\u7248' }
  ];

  const startX = 0.4;
  const stepY = 1.55;
  const stepW = 2.15;
  const gap = 0.15;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const x = startX + i * (stepW + gap);

    // Node circle
    slide.addShape(pres.shapes.OVAL, {
      x: x + stepW/2 - 0.3, y: stepY, w: 0.6, h: 0.6,
      fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
    });
    slide.addText(s.n, {
      x: x + stepW/2 - 0.3, y: stepY, w: 0.6, h: 0.6,
      fontSize: 22, fontFace: 'Arial', color: 'FFFFFF',
      bold: true, align: 'center', valign: 'middle', margin: 0
    });

    slide.addText(s.t, {
      x: x, y: stepY + 0.7, w: stepW, h: 0.32,
      fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(s.d, {
      x: x, y: stepY + 1.05, w: stepW, h: 0.5,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.secondary,
      align: 'center', valign: 'top', margin: 0
    });

    // Arrow between steps
    if (i < steps.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: x + stepW/2 + 0.3, y: stepY + 0.3, w: stepW - 0.3, h: 0,
        line: { color: theme.accent, width: 1.5, endArrowType: 'triangle' }
      });
    }
  }

  // Bottom: left = validator rules; right = meta tags 6 items
  // Left card: validator
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.3, w: 4.4, h: 1.75,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.3, w: 0.1, h: 1.75,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });
  slide.addText('Validator - \u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c\u5668', {
    x: 0.75, y: 3.4, w: 4.1, h: 0.32,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });

  const rules = [
    '\u00b7 \u6807\u7b7e\u5408\u6cd5\u6027\uff1a14 \u79cd MiniMax \u652f\u6301\u7684\u82f1\u6587\u7ed3\u6784\u6807\u7b7e',
    '\u00b7 \u4e2d\u82f1\u6620\u5c04\uff1a10 \u79cd\u4e2d\u6587\u6807\u7b7e\u2192\u82f1\u6587\u6807\u7b7e\u81ea\u52a8\u63d0\u793a',
    '\u00b7 \u5b57\u6570\u4e0a\u9650\uff1aStyles \u2264 2000 / Lyrics \u2264 3500',
    '\u00b7 \u7ed3\u6784\u987a\u5e8f\uff1a\u5f00\u5934\u5e94\u4e3a Intro/Verse\uff0c\u5fc5\u542b Chorus',
    '\u00b7 \u6ce8\u8bb0\u683c\u5f0f\uff1a\u6807\u7b7e\u540e\u53ef\u52a0\u4e00\u884c\u5706\u62ec\u53f7\u6ce8\u8bb0',
    '\u00b7 \u9632\u811a\u624b\u67b6\uff1a\u5143\u6807\u7b7e\u516d\u9879\u5b8c\u6574\u6027\u63d0\u9192'
  ];
  const ruleLines = rules.map((r, i) => ({ text: r, options: { breakLine: i < rules.length - 1 } }));
  slide.addText(ruleLines, {
    x: 0.75, y: 3.75, w: 4.1, h: 1.25,
    fontSize: 10.5, fontFace: 'Microsoft YaHei', color: theme.primary,
    align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
  });

  // Right card: 6 meta tags
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 3.3, w: 4.4, h: 1.75,
    fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 3.3, w: 0.1, h: 1.75,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText('Meta-Tags - \u624b\u518c\u5fc5\u4ea4\u300c\u5143\u6807\u7b7e\u8bbe\u8ba1\u300d\u516d\u9879', {
    x: 5.35, y: 3.4, w: 4.1, h: 0.32,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0
  });

  const tags = [
    { k: 'Genre', v: '\u4f53\u8f7d\u98ce\u683c' },
    { k: 'BPM', v: '\u8282\u62cd\u6570' },
    { k: 'Key', v: '\u8c03\u5f0f' },
    { k: 'Vocals', v: '\u4eba\u58f0\u7c7b\u578b' },
    { k: 'Instruments', v: '\u4f50\u5668\u7f16\u5236' },
    { k: 'Arrangement', v: '\u7f16\u66f2\u5c42\u6b21' }
  ];
  const tagW = 1.3;
  const tagGap = 0.1;
  const tagStartX = 5.35;
  const tagStartY = 3.8;
  for (let i = 0; i < tags.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = tagStartX + col * (tagW + tagGap);
    const y = tagStartY + row * 0.6;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: tagW, h: 0.5,
      fill: { color: theme.bg }, line: { color: theme.accent, width: 0.5 },
      rectRadius: 0.04
    });
    slide.addText(tags[i].k, {
      x: x + 0.05, y: y + 0.02, w: tagW - 0.1, h: 0.22,
      fontSize: 11, fontFace: 'Arial', color: theme.accent,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(tags[i].v, {
      x: x + 0.05, y: y + 0.24, w: tagW - 0.1, h: 0.24,
      fontSize: 10, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'middle', margin: 0
    });
  }

  slide.addText('09', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };