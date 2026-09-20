// Slide 11: Section Divider - 04 创作过程
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  slide.addText('04', {
    x: 0.5, y: 1.3, w: 4.5, h: 3.2,
    fontSize: 280, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 0.06, h: 2.2,
    fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }
  });

  slide.addText('\u521b\u4f5c\u8fc7\u7a0b', {
    x: 5.55, y: 1.75, w: 4.0, h: 0.8,
    fontSize: 48, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  slide.addText('CREATIVE PROCESS', {
    x: 5.55, y: 2.65, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.light,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  slide.addText('12 \u5929\u4f5c\u54c1\u5b8c\u6210\u786c\u7ebf \u00b7 19 \u5929\u6750\u6599\u4e0e\u63d0\u4ea4\u7a97\u53e3', {
    x: 5.55, y: 3.2, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.light,
    align: 'left', valign: 'middle', margin: 0
  });

  slide.addText('11', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };