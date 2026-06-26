import { memo, type ReactNode } from 'react'

import type { BlockquoteBlockData, MarkdownBlock } from '../types'

interface BlockquoteBlockProps {
  block: BlockquoteBlockData
  renderChild: (block: MarkdownBlock) => ReactNode
}

export const BlockquoteBlock = memo(
  function BlockquoteBlock({ block, renderChild }: BlockquoteBlockProps) {
    return (
      <blockquote className="ai-md-blockquote">
        {block.children.map((child) => (
          <div key={child.id} className="ai-md-blockquote-item">
            {renderChild(child)}
          </div>
        ))}
      </blockquote>
    )
  },
  (prev, next) => prev.block.raw === next.block.raw,
)
