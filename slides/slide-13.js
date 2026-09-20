// Slide 13: Section Divider - 05 作品特色
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  slide.addText('05', {
    x: 0.5, y: 1.3, w: 4.5, h: 3.2,
    fontSize: 280, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 0.06, h: 2.2,
    fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }
  });

  slide.addText('\u4f5c\u54c1\u7279\u8272', {
    x: 5.55, y: 1.75, w: 4.0, h: 0.8,
    fontSize: 48, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  slide.addText('INNOVATION HIGHLIGHTS', {
    x: 5.55, y: 2.65, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.light,
    italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  slide.addText('\u4e09\u5927\u521b\u65b0\u70b9 + \u91cf\u5316\u8bc1\u636e + \u4eba\u5de5\u5e72\u9884\u8bc1\u636e\u94fe', {
    x: 5.55, y: 3.2, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.light,
    align: 'left', valign: 'middle', margin: 0
  });

  slide.addText('13', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };