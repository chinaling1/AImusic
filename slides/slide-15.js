// Slide 15: Section Divider - 06 总结与展望
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  slide.addText('06', {
    x: 0.5, y: 1.3, w: 4.5, h: 3.2,
    fontSize: 280, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 0.06, h: 2.2,
    fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }
  });

  slide.addText('\u603b\u7ed3\u4e0e\u5c55\u671b', {
    x: 5.55, y: 1.75, w: 4.0, h: 0.8,
    fontSize: 48, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  slide.addText('SUMMARY & OUTLOOK', {
    x: 5.55, y: 2.65, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.light,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  slide.addText('\u521b\u4f5c\u6536\u83b7 \u00b7 \u4e0d\u8db3\u4e0e\u6539\u8fdb \u00b7 \u672a\u6765\u65b9\u5411', {
    x: 5.55, y: 3.2, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.light,
    align: 'left', valign: 'middle', margin: 0
  });

  slide.addText('15', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };