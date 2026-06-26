import { memo, useLayoutEffect, useMemo, useRef } from 'react'

import { BlockRenderer } from './BlockRenderer'
import { getMarkdownIt } from './markdown-it'
import { normalizeStreamingMarkdown } from './normalize'
import { assignStableIds, parseMarkdownBlocks } from './parseBlocks'
import type { MarkdownBlock } from './types'

interface StreamingMarkdownProps {
  content: string
  streaming?: boolean
}

export const StreamingMarkdown = memo(function StreamingMarkdown({
  content,
  streaming = false,
}: StreamingMarkdownProps) {
  const previousBlocksRef = useRef<MarkdownBlock[]>([])
  const md = getMarkdownIt()

  const draftBlocks = useMemo(() => {
    const { normalized, isPartial } = streaming
      ? normalizeStreamingMarkdown(content)
      : { normalized: content, isPartial: false }

    const parsed = parseMarkdownBlocks(normalized, md)

    if (isPartial) {
      return parsed.map((block, index, all) => {
        if (index !== all.length - 1 || block.type !== 'code') return block
        return { ...block, isPartial: true }
      })
    }

    return parsed
  }, [content, md, streaming])

  const blocks = useMemo(
    () => assignStableIds(draftBlocks, previousBlocksRef.current),
    [draftBlocks],
  )

  useLayoutEffect(() => {
    previousBlocksRef.current = blocks
  }, [blocks])

  if (!content.trim()) {
    return streaming ? <span className="ai-md-placeholder">...</span> : null
  }

  return (
    <div className="ai-md-root">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
})
