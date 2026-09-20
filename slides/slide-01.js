// Slide 01: Cover - 封面
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // 左侧深蓝竖条(古风印章感)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.45, h: 5.625,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 }
  });

  // 右上角小印章方块
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.55, y: 0.45, w: 0.9, h: 0.9,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText('AI\nMUSIC', {
    x: 8.55, y: 0.45, w: 0.9, h: 0.9,
    fontSize: 14, fontFace: 'Arial', color: 'FFFFFF',
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  // 顶部细线 - 比赛信息
  slide.addText('2026 (Inaugural) National College Student Digital Intelligence Chain Application Competition', {
    x: 0.9, y: 0.6, w: 7.5, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: theme.secondary,
    italic: true, align: 'left', valign: 'middle', margin: 0
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: 1.0, w: 7.5, h: 0,
    line: { color: theme.accent, width: 1.2 }
  });

  // 标题块:作品名(特大)
  slide.addText('\u300c\u4e45\u522b04\u300d', {
    x: 0.9, y: 1.25, w: 7.5, h: 1.5,
    fontSize: 88, fontFace: 'Microsoft YaHei', color: theme.accent,
    bold: true, align: 'left', valign: 'middle', margin: 0, charSpacing: 12
  });

  // 副标题:项目名
  slide.addText('\u53e4\u97f5 AI  \u00b7  \u53e4\u98ce\u97f3\u4e50\u63d0\u793a\u8bcd\u5de5\u574a', {
    x: 0.9, y: 2.85, w: 7.5, h: 0.55,
    fontSize: 22, fontFace: 'Microsoft YaHei', color: theme.primary,
    bold: false, align: 'left', valign: 'middle', margin: 0, charSpacing: 4
  });

  // 赛道标签
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.9, y: 3.55, w: 4.0, h: 0.5,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.05
  });
  slide.addText('\u4eba\u5de5\u667a\u80fd\u5927\u7c7b  \u00b7  AI \u97f3\u4e50\u8d5b\u9053', {
    x: 0.9, y: 3.55, w: 4.0, h: 0.5,
    fontSize: 15, fontFace: 'Microsoft YaHei', color: 'FFFFFF',
    bold: true, align: 'center', valign: 'middle', margin: 0
  });

  // 底部:分类说明
  slide.addText('\u672c\u5730\u90e8\u7f72 + \u4ee5\u539f\u521b\u6216\u6539\u8fdb\u7b97\u6cd5\u4e3a\u6838\u5fc3  \u00b7  \u4eba\u673a\u534f\u540c\u521b\u4f5c', {
    x: 0.9, y: 4.4, w: 7.5, h: 0.4,
    fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.secondary,
    italic: false, align: 'left', valign: 'middle', margin: 0
  });

  // 底部细线 + 元数据
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: 4.95, w: 7.5, h: 0,
    line: { color: theme.secondary, width: 0.5 }
  });
  slide.addText('\u6f14\u793a\u8bfe\u4ef6  |  Presentation Deck', {
    x: 0.9, y: 5.05, w: 4.0, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: theme.secondary,
    align: 'left', valign: 'middle', margin: 0
  });
  slide.addText('2026.09', {
    x: 7.5, y: 5.05, w: 0.9, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: theme.accent,
    bold: true, align: 'right', valign: 'middle', margin: 0
  });
}

module.exports = { createSlide };