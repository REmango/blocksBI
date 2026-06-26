import { memo } from 'react'

import type { InlineNode } from '../types'
import { InlineContent } from './InlineContent'

interface LinkInlineProps {
  href: string
  nodes: InlineNode[]
}

export const LinkInline = memo(function LinkInline({ href, nodes }: LinkInlineProps) {
  const safeHref = href.startsWith('http://') || href.startsWith('https://') ? href : undefined

  if (!safeHref) {
    return (
      <span className="ai-md-link ai-md-link--invalid">
        <InlineContent nodes={nodes} />
      </span>
    )
  }

  return (
    <a
      className="ai-md-link"
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      <InlineContent nodes={nodes} />
    </a>
  )
})
