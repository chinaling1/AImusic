import SectionCard from '../common/SectionCard'

export interface Issue {
  level: 'error' | 'warning' | 'info'
  where: string
  message: string
}

export interface ValidateResult {
  ok: boolean
  issues: Issue[]
  stats: {
    styles_chars: number
    styles_limit: number
    lyrics_chars: number
    lyrics_limit: number
    sections: string[]
    section_count: number
  }
}

const levelStyle: Record<Issue['level'], string> = {
  error: 'bg-vermilion/10 text-vermilion-light',
  warning: 'bg-gold/10 text-gold',
  info: 'bg-ink text-rice-dark',
}

const levelLabel: Record<Issue['level'], string> = {
  error: '错误',
  warning: '警告',
  info: '提示',
}

/** 右栏格式校验结果：整体结论徽标 + 问题列表 */
export default function ValidationPanel({ validation }: { validation: ValidateResult | null }) {
  return (
    <SectionCard
      title="格式校验"
      actions={
        validation && (
          <span className={`text-xs px-2 py-0.5 rounded ${validation.ok ? 'bg-green-600/20 text-green-400' : 'bg-vermilion/20 text-vermilion-light'}`}>
            {validation.ok ? '通过' : '存在问题'}
          </span>
        )
      }
    >
      {!validation ? (
        <p className="text-rice-dark text-xs">校验中...</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {validation.issues.length === 0 && (
            <p className="text-green-400 text-xs">✓ 标签、字符数、结构均符合 MiniMax 格式要求</p>
          )}
          {validation.issues.map((issue, i) => (
            <div key={i} className={`text-xs leading-relaxed p-2 rounded ${levelStyle[issue.level]}`}>
              [{levelLabel[issue.level]}] {issue.message}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
