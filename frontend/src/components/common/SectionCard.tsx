import type { ReactNode } from 'react'

interface SectionCardProps {
  /** 卡片标题，留空则不渲染标题栏 */
  title?: ReactNode
  /** 标题栏右上角插槽（计数、按钮等） */
  actions?: ReactNode
  /** 附加在卡片容器上的类名，用于覆盖栅格/间距 */
  className?: string
  children: ReactNode
}

/** 统一的带标题栏卡片容器 */
export default function SectionCard({ title, actions, className = '', children }: SectionCardProps) {
  const hasHeader = Boolean(title || actions)

  return (
    <div className={`bg-ink-light border border-gold/20 rounded-xl p-6 ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-gold text-sm font-medium">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
