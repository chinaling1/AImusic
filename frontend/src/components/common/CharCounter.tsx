interface CharCounterProps {
  current: number
  limit: number
  /** 是否显示「字符」后缀，默认显示 */
  showUnit?: boolean
}

/** 字符计数，超出上限时标红 */
export default function CharCounter({ current, limit, showUnit = true }: CharCounterProps) {
  const overLimit = current > limit

  return (
    <span className={`text-xs ${overLimit ? 'text-vermilion-light' : 'text-rice-dark'}`}>
      {current} / {limit}{showUnit ? ' 字符' : ''}
    </span>
  )
}
