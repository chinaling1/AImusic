// Slide 05: Content - 作品简介与差异化定位
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText('01  /  ' + '\u4f5c\u54c1\u6982\u8ff0', {
    x: 0.5, y: 0.35, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });
  slide.addText('\u300a\u4e45\u522b04\u300b\u4f5c\u54c1\u7b80\u4ecb\u4e0e\u5dee\u5f02\u5316\u5b9a\u4f4d', {
    x: 0.5, y: 0.7, w: 8.5, h: 0.65,
    fontSize: 30, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // One-line description
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 9.0, h: 1.1,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.08
  });
  slide.addText('\u300a\u4e45\u522b04\u300b\u662f\u4e00\u9996\u53e4\u98ce\u79bb\u522b\u4e3b\u9898\u7684 AI \u97f3\u4e50\u521b\u4f5c\u4f5c\u54c1\u3002\u672c\u5730\u63d0\u793a\u8bcd\u5de5\u574a\u8d1f\u8d23\u751f\u6210\u7ed3\u6784\u5316\u63d0\u793a\u8bcd\u5305\uff08Meta + Styles + Lyrics\uff09\u4e0e\u786e\u5b9a\u6027\u683c\u5f0f\u6821\u9a8c\uff1b\u4ee5\u300c\u590d\u5236\u63d0\u793a\u8bcd\u00b7\u6253\u5f00 MiniMax \u97f3\u4e50\u7f51\u9875\u7248\u00b7\u7c98\u8d34\u751f\u6210\u300d\u4e09\u6b65\u5b8c\u6210\u4ea4\u4ed8\u3002\u5168\u94fe\u8def\u6bcf\u6b65\u4ea7\u51fa\u300coriginal / ai_optimized / human_modified\u300d\u4e09\u7c7b\u7248\u672c\u5168\u90e8\u5165\u5e93\u53ef\u67e5\u3002', {
    x: 0.8, y: 1.6, w: 8.4, h: 1.0,
    fontSize: 14, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    align: 'left', valign: 'middle', margin: 0
  });

  // Compare two columns
  const cols = [
    {
      x: 0.5, w: 4.4,
      title: '\u5546\u4e1a AI \u97f3\u4e50\u5de5\u5177\u7684\u73b0\u72b6',
      sub: 'COMMON',
      color: theme.secondary,
      rows: [
        '\u00b7 \u7aef\u5230\u7aef\u62bd\u5361\u5f0f\u751f\u6210\uff0c\u6210\u54c1\u53d7\u968f\u673a\u6027\u5f71\u54cd',
        '\u00b7 \u63d0\u793a\u8bcd\u4e0e\u8f93\u51fa\u4e4b\u95f4\u7f3a\u5c11\u53ef\u89c1\u7684\u4e2d\u95f4\u73af\u8282',
        '\u00b7 \u4f7f\u7528\u8fc7\u7a0b\u4e2d\u7684\u4eba\u5de5\u7f16\u8f91\u96be\u4ee5\u8ddf\u8e2a\u4e0e\u8bc9\u8bc1',
        '\u00b7 \u300c\u63d0\u793a\u8bcd\u7cbe\u51c6\u3001\u4eba\u5de5\u5e72\u9884\u5145\u5206\u300d\u96be\u4ee5\u91cf\u5316'
      ]
    },
    {
      x: 5.1, w: 4.4,
      title: '\u300a\u4e45\u522b04\u300b\u7684\u5dee\u5f02\u5316',
      sub: 'OURS',
      color: theme.accent,
      rows: [
        '\u00b7 \u4e09\u6b65\u660e\u786e\u5212\u5206\uff1a\u63d0\u793a\u8bcd\u4f18\u5316 \u2192 \u6b4c\u8bcd\u751f\u6210 \u2192 \u683c\u5f0f\u6821\u9a8c',
        '\u00b7 \u63d0\u793a\u8bcd\u4ee5 Meta + Styles + Lyrics \u4e09\u6bb5\u5f0f\u7ed3\u6784\u5316\u751f\u6210\uff0c\u53ef\u76f4\u63a5\u7c98\u8d34',
        '\u00b7 \u672c\u5730\u786e\u5b9a\u6027\u6821\u9a8c\uff1a\u6807\u7b7e/\u5b57\u6570/\u6ce8\u8bb0/\u5143\u6807\u7b7e\u516d\u9879\u5168\u8986\u76d6',
        '\u00b7 \u6bcf\u6b65\u4e09\u7c7b\u7248\u672c\u5168\u90e8\u5165\u5e93\uff0c\u300c\u4eba\u5de5\u5e72\u9884\u300d\u4ee5\u7248\u672c\u5386\u53f2\u53ef\u67e5'
      ]
    }
  ];
  for (const col of cols) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: col.x, y: 2.85, w: col.w, h: 2.05,
      fill: { color: 'FFFFFF' }, line: { color: theme.secondary, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: col.x, y: 2.85, w: 0.1, h: 2.05,
      fill: { color: col.color }, line: { color: col.color, width: 0 }
    });
    slide.addText(col.title, {
      x: col.x + 0.25, y: 2.95, w: col.w - 0.35, h: 0.4,
      fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.primary,
      bold: true, align: 'left', valign: 'middle', margin: 0
    });
    slide.addText(col.sub, {
      x: col.x + 0.25, y: 3.35, w: col.w - 0.35, h: 0.25,
      fontSize: 9, fontFace: 'Arial', color: col.color,
      italic: true, bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
    });
    const lines = col.rows.map((r, i) => ({
      text: r, options: { breakLine: i < col.rows.length - 1 }
    }));
    slide.addText(lines, {
      x: col.x + 0.25, y: 3.65, w: col.w - 0.4, h: 1.15,
      fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.primary,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 4
    });
  }

  slide.addText('05', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: theme.secondary,
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };