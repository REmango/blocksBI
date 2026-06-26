import { memo } from 'react'

import type { ListBlockData } from '../types'
import { InlineContent } from './InlineContent'

interface ListBlockProps {
  block: ListBlockData
}

export const ListBlock = memo(
  function ListBlock({ block }: ListBlockProps) {
    const ListTag = block.ordered ? 'ol' : 'ul'

    return (
      <ListTag
        className={`ai-md-list ${block.ordered ? 'ai-md-list--ordered' : 'ai-md-list--bullet'}`}
        start={block.ordered ? block.start : undefined}
      >
        {block.items.map((item, index) => (
          <li key={`${block.id}-item-${index}`} className="ai-md-list-item">
            <InlineContent nodes={item.inlines} />
          </li>
        ))}
      </ListTag>
    )
  },
  (prev, next) => prev.block.raw === next.block.raw && prev.block.ordered === next.block.ordered,
)
