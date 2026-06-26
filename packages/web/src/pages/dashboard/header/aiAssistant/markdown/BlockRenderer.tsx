import { memo } from 'react'

import type { MarkdownBlock } from './types'
import { BlockquoteBlock } from './blocks/BlockquoteBlock'
import { CodeBlock } from './blocks/CodeBlock'
import { HeadingBlock } from './blocks/HeadingBlock'
import { HrBlock } from './blocks/HrBlock'
import { ListBlock } from './blocks/ListBlock'
import { ParagraphBlock } from './blocks/ParagraphBlock'
import { TableBlock } from './blocks/TableBlock'

interface BlockRendererProps {
  block: MarkdownBlock
}

function renderBlock(block: MarkdownBlock) {
  switch (block.type) {
    case 'code':
      return <CodeBlock block={block} />
    case 'paragraph':
      return <ParagraphBlock block={block} />
    case 'heading':
      return <HeadingBlock block={block} />
    case 'list':
      return <ListBlock block={block} />
    case 'table':
      return <TableBlock block={block} />
    case 'blockquote':
      return (
        <BlockquoteBlock
          block={block}
          renderChild={(child) => <BlockNode block={child} />}
        />
      )
    case 'hr':
      return <HrBlock block={block} />
    default:
      return null
  }
}

const BlockNode = memo(function BlockNode({ block }: BlockRendererProps) {
  return renderBlock(block)
}, blockPropsAreEqual)

function blockPropsAreEqual(prev: BlockRendererProps, next: BlockRendererProps): boolean {
  return prev.block === next.block
}

export const BlockRenderer = BlockNode

export function renderMarkdownBlock(block: MarkdownBlock) {
  return <BlockNode block={block} />
}
