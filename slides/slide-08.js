// Slide 08: Section Divider - 03 核心技术
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  slide.addText('03', {
    x: 0.5, y: 1.3, w: 4.5, h: 3.2,
    fontSize: 280, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 0.06, h: 2.2,
    fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }
  });

  slide.addText('\u6838\u5fc3\u6280\u672f', {
    x: 5.55, y: 1.75, w: 4.0, h: 0.8,
    fontSize: 48, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  slide.addText('CORE ALGORITHMS', {
    x: 5.55, y: 2.65, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.light,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  slide.addText('\u63d0\u793a\u8bcd\u7ed3\u6784\u5316 \u00b7 \u672c\u5730\u786e\u5b9a\u6027\u6821\u9a8c \u00b7 \u7248\u672c\u5168\u94fe\u8def\u53ef\u5ba1\u8ba1', {
    x: 5.55, y: 3.2, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.light,
    align: 'left', valign: 'middle', margin: 0
  });

  slide.addText('08', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };