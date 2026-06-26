import { memo } from 'react'

import type { InlineNode } from '../types'
import { LinkInline } from './LinkInline'

interface InlineContentProps {
  nodes: InlineNode[]
}

function renderInlineNode(node: InlineNode, index: number) {
  switch (node.type) {
    case 'text':
      return <span key={index}>{node.content}</span>
    case 'break':
      return <br key={index} />
    case 'code':
      return (
        <code key={index} className="ai-md-inline-code">
          {node.content}
        </code>
      )
    case 'link':
      return (
        <LinkInline key={index} href={node.href ?? '#'} nodes={node.children ?? []} />
      )
    case 'strong':
      return (
        <strong key={index}>
          <InlineContent nodes={node.children ?? []} />
        </strong>
      )
    case 'em':
      return (
        <em key={index}>
          <InlineContent nodes={node.children ?? []} />
        </em>
      )
    default:
      return null
  }
}

export const InlineContent = memo(function InlineContent({ nodes }: InlineContentProps) {
  return <>{nodes.map(renderInlineNode)}</>
})
