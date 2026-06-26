import { memo } from 'react'

import type { ParagraphBlockData } from '../types'
import { InlineContent } from './InlineContent'

interface ParagraphBlockProps {
  block: ParagraphBlockData
}

export const ParagraphBlock = memo(
  function ParagraphBlock({ block }: ParagraphBlockProps) {
    return (
      <p className="ai-md-paragraph">
        <InlineContent nodes={block.inlines} />
      </p>
    )
  },
  (prev, next) => prev.block.raw === next.block.raw,
)
