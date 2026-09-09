import SectionCard from '../common/SectionCard'

/** MiniMax 网页版粘贴操作指引，纯音乐模式下歌词步骤不同 */
export default function MiniMaxSteps({ instrumental }: { instrumental: boolean }) {
  return (
    <SectionCard title="MiniMax 网页版操作步骤">
      <ol className="text-rice-dark text-xs space-y-2 leading-relaxed list-decimal list-inside">
        <li>打开 minimax.io/audio/music（或国内 minimaxi.com/audio），登录并选择 Music-3.0</li>
        <li>将 ① 复制的 Styles 描述粘贴到风格输入框（ Styles 区）</li>
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
