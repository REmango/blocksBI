import { memo } from 'react'

import type { HeadingBlockData } from '../types'
import { InlineContent } from './InlineContent'

interface HeadingBlockProps {
  block: HeadingBlockData
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

export const HeadingBlock = memo(
  function HeadingBlock({ block }: HeadingBlockProps) {
    const Tag = HEADING_TAGS[Math.min(Math.max(block.level, 1), 6) - 1]

    return (
      <Tag className={`ai-md-heading ai-md-heading--${block.level}`}>
        <InlineContent nodes={block.inlines} />
      </Tag>
    )
  },
  (prev, next) => prev.block.raw === next.block.raw && prev.block.level === next.block.level,
)
