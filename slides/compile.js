// compile.js - 编译所有 slide 模块生成最终 PPT
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Guyun AI Project';
pres.title = '\u4e45\u522b - \u53e4\u97f5 AI \u6f14\u793a\u8bfe\u4ef6';
pres.company = '\u5168\u56fd\u5927\u5b66\u751f\u6570\u667a\u94fe\u5e94\u7528\u5927\u8d5b';
pres.subject = 'AI \u97f3\u4e50\u8d5b\u9053 \u00b7 \u6f14\u793a\u8bfe\u4ef6';

// Vintage & Academic 主题（古风 + 学术）
const theme = {
  primary:   '003049',   // 深蓝
  secondary: '669bbc',   // 蓝灰
  accent:    '780000',   // 深红
  light:     'c1121f',   // 亮红
  bg:        'fdf0d5'    // 米黄
};

// 加载并执行所有 slide 模块
const slideFiles = [
  'slide-01.js', 'slide-02.js', 'slide-03.js', 'slide-04.js',
  'slide-05.js', 'slide-06.js', 'slide-07.js', 'slide-08.js',
  'slide-09.js', 'slide-10.js', 'slide-11.js', 'slide-12.js',
  'slide-13.js', 'slide-14.js', 'slide-15.js', 'slide-16.js',
  'slide-17.js'
];

for (const f of slideFiles) {
  const mod = require('./' + f);
  mod.createSlide(pres, theme);
}

pres.writeFile({ fileName: './output/\u4e45\u522b04-\u6f14\u793a\u8bfe\u4ef6.pptx' })
  .then(name => {
    console.log('PPTX written: ' + name);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });