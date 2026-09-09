// 古韵AI — MiniMax 提示词工坊 UI 端到端测试
// 用 Playwright 驱动真实 Chromium 走完三步主流程并截图（截图可供参赛材料使用）
const { chromium } = require('playwright-core');

const CHROME = 'C:/Users/ZI/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe';
const BASE = 'http://localhost:5173';
const SHOT_DIR = 'G:/cunchu/大学/作业/AI音乐/测试截图';
const IDEA = '写一首以匠心传承为主题的古风歌曲，古筝与笛子对答，副歌大气磅礴，女声清亮婉转，适合非遗主题晚会演唱';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('页面异常: ' + e.message));

  const log = (msg) => console.log(msg);

  // ---------- Step 1：提示词 ----------
  await page.goto(BASE, { waitUntil: 'networkidle' });
  log('[1] 页面标题: ' + (await page.title()));
  log('[1] 页头文字: ' + (await page.locator('h1').first().innerText()));
  await page.locator('textarea').first().fill(IDEA);
  await page.screenshot({ path: `${SHOT_DIR}/1-输入创意.png` });
  await page.getByRole('button', { name: /生成 MiniMax 提示词/ }).click();
  log('[1] 已点击生成，等待 LLM 返回...');
  // 等待元标签出现
  // 元标签位于 textarea 内（innerText 读不到），以可见区块标题 + textarea 值双重判定
  await page.waitForFunction(() => document.body.innerText.includes('结构化元标签'), null, { timeout: 180000 });
  await page.waitForFunction(() => {
    const areas = Array.from(document.querySelectorAll('textarea'));
    return areas.some((a) => a.value.includes('[Genre]') && a.value.includes('[Arrangement]'));
  }, null, { timeout: 180000 });
  const metaOk = await page.locator('text=[BPM]').count() > 0;
  const stylesOk = await page.locator('text=风格描述').count() > 0;
  log(`[1] 元标签渲染: ${metaOk} | 风格描述区块: ${stylesOk}`);
  await page.screenshot({ path: `${SHOT_DIR}/2-生成元标签与风格描述.png`, fullPage: true });

  // ---------- Step 2：歌词 ----------
  await page.getByRole('button', { name: /确认提示词/ }).click();
  await page.waitForTimeout(800);
  log('[2] 当前步骤标题: ' + (await page.locator('h2').first().innerText()));
  await page.getByRole('button', { name: /^生成歌词$/ }).click();
  log('[2] 已点击生成歌词，等待 LLM 返回...');
  await page.waitForFunction(() => document.body.innerText.includes('歌词编辑器'), null, { timeout: 180000 });
  await page.waitForFunction(() => {
    const el = document.getElementById('lyrics-editor');
    return el && /\[(Intro|Verse|Chorus)\]/.test(el.value);
  }, null, { timeout: 180000 });
  const charText = await page.locator('text=/\\d+ \\/ 3500 字符/').first().innerText().catch(() => '(未找到计数)');
  log('[2] 字符计数显示: ' + charText);
  await page.screenshot({ path: `${SHOT_DIR}/3-生成MiniMax格式歌词.png`, fullPage: true });

  // ---------- Step 3：导出 ----------
  await page.getByRole('button', { name: /确认歌词/ }).click();
  await page.waitForTimeout(1500);
  log('[3] 当前步骤标题: ' + (await page.locator('h2').first().innerText()));
  // 校验徽章文本为「通过」/「存在问题」，等待校验区块渲染完成后读取
  await page.waitForFunction(() => document.body.innerText.includes('格式校验'), null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const badge = await page.locator('span', { hasText: /^(通过|存在问题)$/ }).first().innerText().catch(() => '(未找到)');
  log('[3] 校验结论: ' + badge);
  // 打印复制区内容长度，确认两段内容均已带入导出页
  const previews = await page.locator('pre').allInnerTexts();
  log(`[3] 导出页预览块数量: ${previews.length}，首块 ${previews[0]?.length || 0} 字符，次块 ${previews[1]?.length || 0} 字符`);
  await page.screenshot({ path: `${SHOT_DIR}/4-导出提示词包与格式校验.png`, fullPage: true });

  log('[控制台错误] ' + (errors.length ? errors.join(' | ') : '无'));
  await browser.close();
  log('UI 端到端测试完成');
})().catch(async (e) => {
  console.error('测试失败:', e.message);
  process.exit(1);
});
