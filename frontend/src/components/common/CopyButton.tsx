interface CopyButtonProps {
  /** 是否刚复制成功，由父级 useCopy 的 copiedKey 决定 */
  copied: boolean
  onCopy: () => void
  disabled?: boolean
}

/** 复制按钮，文案与状态由父级传入，避免同页面多个按钮状态打架 */
export default function CopyButton({ copied, onCopy, disabled }: CopyButtonProps) {
  return (
    <button
      className="px-4 py-1.5 bg-gold hover:bg-gold-light text-ink rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      onClick={onCopy}
      disabled={disabled}
    >
      {copied ? '✓ 已复制' : '复制'}
    </button>
  )
}
