import { useState } from 'react'
import SectionCard from '../common/SectionCard'
import { MINIMAX_MUSIC_URL } from '../../constants/limits'
import { openExternal } from '../../utils/external'
import { copyText } from '../../hooks/useCopy'

interface MiniMaxStepsProps {
  instrumental: boolean
  /** 待复制到剪贴板（Styles / Lyrics / 完整提示词包）。提供则按钮变"复制并打开"。 */
  launchPayload?: string
  /** launchPayload 有内容时复制失败的兜底文案 */
  launchHint?: string
}

/** MiniMax 网页版粘贴操作指引 + 立即在 MiniMax 中创作入口 */
export default function MiniMaxSteps({ instrumental, launchPayload, launchHint }: MiniMaxStepsProps) {
  const [launched, setLaunched] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const handleLaunch = async () => {
    setCopyFailed(false)
    if (launchPayload && launchPayload.trim()) {
      const ok = await copyText(launchPayload)
      if (!ok) {
        setCopyFailed(true)
        window.setTimeout(() => setCopyFailed(false), 3000)
        // 复制失败也仍然打开 URL，用户可手动粘贴
      }
    }
    const opened = openExternal(MINIMAX_MUSIC_URL)
    if (opened) {
      setLaunched(true)
      window.setTimeout(() => setLaunched(false), 2000)
    }
  }

  return (
    <SectionCard title="MiniMax 网页版操作步骤">
      <button
        className="w-full mb-4 px-4 py-2.5 bg-gradient-to-r from-vermilion to-vermilion-light text-rice rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        onClick={handleLaunch}
        title="在系统默认浏览器中打开 MiniMax 音乐创作页"
      >
        {launched ? '✓ 已打开 MiniMax' : '🚀 立即在 MiniMax 中创作'}
      </button>
      {launchPayload && (
        <p className="text-rice-dark text-xs mb-4 leading-relaxed">
          {copyFailed
            ? launchHint ?? '复制失败，请手动全选文本后再打开 MiniMax 粘贴'
            : '点击按钮会先把内容复制到剪贴板，再打开 MiniMax 创作页，到对应输入框直接粘贴即可'}
        </p>
      )}
      <ol className="text-rice-dark text-xs space-y-2 leading-relaxed list-decimal list-inside">
        <li>登录后选择 Music-3.0 模型</li>
        <li>将 ① 复制的 Styles 描述粘贴到风格输入框</li>
        {instrumental ? (
          <li>打开 Instrumental 开关，歌词框保持留空，点击生成</li>
        ) : (
          <>
            <li>将 ② 复制的歌词粘贴到 Lyrics 输入框（输入 "/" 可查看结构标签）</li>
            <li>确认 Lyrics / Instrumental 开关处于 Lyrics 状态，点击生成</li>
          </>
        )}
        <li>生成后试听；不满意可回到本工具调整提示词重新生成</li>
        <li>满意后下载 mp3，并保存本页导出的提示词包作为创作过程存档</li>
      </ol>
    </SectionCard>
  )
}
