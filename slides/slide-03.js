// Slide 03: Section Divider - 01 作品概述
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // 左侧巨大编号
  slide.addText('01', {
    x: 0.5, y: 1.3, w: 4.5, h: 3.2,
    fontSize: 280, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  // 右侧装饰竖线
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 0.06, h: 2.2,
    fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }
  });

  // 章节标题(中文)
  slide.addText('\u4f5c\u54c1\u6982\u8ff0', {
    x: 5.55, y: 1.75, w: 4.0, h: 0.8,
    fontSize: 48, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 8
  });

  // 英文副标
  slide.addText('BACKGROUND & POSITIONING', {
    x: 5.55, y: 2.65, w: 4.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: theme.light,
    bold: false, italic: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // 一句话简介
  slide.addText('\u4ece\u8d5b\u9053\u75db\u70b9\u51fa\u53d1\uff0c\u5b9a\u4f4d\u300c\u53ef\u5ba1\u8ba1\u3001\u53ef\u590d\u73b0\u3001\u53ef\u8bc9\u8bc1\u7684\u4eba\u5de5\u5e72\u9884\u300d\u521b\u4f5c\u8def\u5f84', {
    x: 5.55, y: 3.2, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.light,
    align: 'left', valign: 'middle', margin: 0
  });

  // 页码
  slide.addText('03', {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: 'FFFFFF',
    align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };