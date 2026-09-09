import CharCounter from '../common/CharCounter'
import SectionCard from '../common/SectionCard'
import { LYRICS_LIMIT } from '../../constants/limits'

// MiniMax 网页版歌词框支持的结构标签（点击插入），覆盖全部官方标签
const QUICK_TAGS = [
  '[Intro]', '[Verse 1]', '[Verse 2]', '[Pre-Chorus]', '[Chorus]',
  '[Post-Chorus]', '[Bridge]', '[Interlude]', '[Hook]', '[Solo]', '[Outro]',
]

const EDITOR_ID = 'lyrics-editor'

/** 与后端 Python len() 对齐的字符计数（按 Unicode 码点，emoji/生僻字不会被多计） */
export function countChars(text: string): number {
  return Array.from(text).length
}

interface LyricEditorProps {
  value: string
  onChange: (value: string) => void
}

/** 歌词编辑器：结构标签快捷插入 + MiniMax 格式文本域 */
export default function LyricEditor({ value, onChange }: LyricEditorProps) {
  /** 在光标处插入结构标签（独占一行） */
  const insertTag = (tag: string) => {
    const textarea = document.getElementById(EDITOR_ID) as HTMLTextAreaElement | null
    if (!textarea) {
      onChange(`${value}\n${tag}\n`)
      return
    }
    const start = textarea.selectionStart
    const before = value.slice(0, start)
    const after = value.slice(textarea.selectionEnd)
    // 保证标签前面有换行
    const prefix = before && !before.endsWith('\n') ? '\n' : ''
    const next = `${before}${prefix}${tag}\n${after}`
    onChange(next)
    // 光标移到标签行之后
    requestAnimationFrame(() => {
      const pos = (before + prefix + tag + '\n').length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  return (
    <SectionCard
      title="歌词编辑器（MiniMax 格式）"
      actions={<CharCounter current={countChars(value)} limit={LYRICS_LIMIT} />}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 border border-gold/30 text-gold hover:bg-gold/10 rounded text-xs font-mono transition-colors"
            onClick={() => insertTag(tag)}
            title="点击在光标处插入结构标签"
          >
            {tag}
          </button>
        ))}
      </div>
      <textarea
        id={EDITOR_ID}
        className="w-full h-72 bg-ink border border-gold/20 rounded-lg p-4 text-rice text-sm font-mono placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 resize-none leading-6"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'[Intro]\n(古筝泛音与箫声渐入)\n\n[Verse 1]\n歌词第一行\n歌词第二行\n\n[Chorus]\n...'}
      />
      <p className="text-rice-dark text-xs mt-2 leading-relaxed">
        结构标签独占一行、必须英文（网页版输入 "/" 可快捷插入）；标签下一行可用圆括号写编曲/人声/情绪注记
      </p>
    </SectionCard>
  )
}
