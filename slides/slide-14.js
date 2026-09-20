// Slide 14: Content - 三大可证据创新点(按代码实际)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('05  /  ' + '\u4f5c\u54c1\u7279\u8272', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u4e09\u9879\u53ef\u8bc9\u8bc1\u7684\u521b\u65b0\u70b9', {
    x: 0.5, y: 0.7, w: 7.5, h: 0.65,
    fontSize: 30, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  const cards = [
    {
      n: '01',
      title: '\u63d0\u793a\u8bcd\u4e09\u6bb5\u5f0f\u7ed3\u6784\u5316',
      sub: 'Three-Section Structured Prompt',
      desc: 'OPTIMIZE_PROMPT \u6a21\u677f\u5f3a\u5236\u8f93\u51fa\u300c===META=== \u4e0e ===STYLES===\u300d\u4e24\u6bb5\uff0c\u5143\u6807\u7b7e\u516d\u9879\u987b\u4e8e\u7b2c\u4e00\u6bb5\uff0cStyles \u9650\u5236 80-200 \u5b57\uff0c\u7ed3\u6784\u5316\u540e\u53ef\u4e00\u952e\u7c98\u8d34',
      stat: '2',
      statLabel: '\u6bb5\u5f0f\u5206\u9694\u7b26',
      color: theme.primary
    },
    {
      n: '02',
      title: '\u672c\u5730\u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c',
      sub: 'Deterministic Format Validator',
      desc: 'minimax.py \u63d0\u4f9b 14 \u79cd\u7ed3\u6784\u6807\u7b7e\u5408\u6cd5\u6027 + \u4e2d\u82f1\u6620\u5c04\u3001\u5b57\u6570\u4e0a\u9650\u3001\u6ce8\u8bb0\u683c\u5f0f\u3001\u7ed3\u6784\u987a\u5e8f\u3001\u5143\u6807\u7b7e\u516d\u9879\u5b8c\u6574\u6027\u516d\u9879\u5168\u8986\u76d6\uff1b\u4e0d\u4f9d\u8d56 LLM\uff0c\u53ef\u72ec\u7acb\u8bc1\u636e',
      stat: '14',
      statLabel: '\u79cd\u7ed3\u6784\u6807\u7b7e',
      color: theme.accent
    },
    {
      n: '03',
      title: '\u4e09\u7c7b\u7248\u672c\u5165\u5e93',
      sub: 'Three-Type Version Tracking',
      desc: 'SQLite \u4e2d prompt_versions \u8868\u8bb0\u5f55\u6bcf\u4f8b\u63d0\u793a\u8bcd/\u6b4c\u8bcd\u7684 original / ai_optimized / human_modified \u4e09\u7c7b\u8bb0\u5f55\uff0c\u5e26 session_id / parent_version_id / note\uff0c\u53ef\u6309\u4f1a\u8bdd\u67e5\u8be2\u5168\u90e8\u5386\u53f2',
      stat: '3',
      statLabel: '\u4e2a\u7248\u672c\u7c7b\u578b',
      color: theme.light
    }
  ];

  let cy = 1.55;
  const cardH = 1.05;
  const cardGap = 0.13;
  for (const c of cards) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: 9.0, h: cardH,
      fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: 0.1, h: cardH,
      fill: { color: c.color }, line: { color: c.color, width: 0 }
    });
    slide.addText(c.n, {
      x: 0.7, y: cy + 0.1, w: 0.6, h: 0.55,
      fontSize: 30, fontFace: 'Arial', color: c.color,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(c.title, {
      x: 1.35, y: cy + 0.08, w: 4.0, h: 0.32,
      fontSize: 15, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(c.sub, {
      x: 1.35, y: cy + 0.42, w: 4.0, h: 0.25,
      fontSize: 10, fontFace: 'Arial', color: c.color,
      italic: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(c.desc, {
      x: 1.35, y: cy + 0.7, w: 6.0, h: 0.35,
      fontSize: 9.5, fontFace: 'Microsoft YaHei', color: theme.secondary,
      align: 'left', valign: 'top', margin: 0
    });
    slide.addText(c.stat, {
      x: 7.6, y: cy + 0.1, w: 1.5, h: 0.65,
      fontSize: 42, fontFace: 'Arial', color: c.color,
      bold: true, align: 'right', valign: 'middle', margin: 0
    });
    slide.addText(c.statLabel, {
      x: 5.5, y: cy + 0.75, w: 3.6, h: 0.3,
      fontSize: 10, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'right', valign: 'middle', margin: 0
    });
    cy += cardH + cardGap;
  }

  slide.addText('14', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };