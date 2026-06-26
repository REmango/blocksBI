import type { Token } from 'markdown-it'

import type { InlineNode, InlineNodeType } from './types'

const INLINE_CONTAINER_PAIRS: Record<string, InlineNodeType> = {
  link_open: 'link',
  strong_open: 'strong',
  em_open: 'em',
}

function closeTagFor(openTag: string): string {
  return openTag.replace('_open', '_close')
}

function parseInlineChildren(children: Token[]): InlineNode[] {
  const nodes: InlineNode[] = []
  let index = 0

  while (index < children.length) {
    const token = children[index]

    if (token.type === 'text') {
      if (token.content) {
        nodes.push({ type: 'text', content: token.content })
      }
      index++
      continue
    }

    if (token.type === 'code_inline') {
      nodes.push({ type: 'code', content: token.content })
      index++
      continue
    }

    if (token.type === 'softbreak' || token.type === 'hardbreak') {
      nodes.push({ type: 'break' })
      index++
      continue
    }

    const containerType = INLINE_CONTAINER_PAIRS[token.type]
    if (containerType) {
      const closeType = closeTagFor(token.type)
      const inner: Token[] = []
      index++
      while (index < children.length && children[index].type !== closeType) {
        inner.push(children[index])
        index++
      }
      index++

      const node: InlineNode = {
        type: containerType,
        children: parseInlineChildren(inner),
      }
      if (containerType === 'link') {
        node.href = token.attrGet('href') ?? ''
      }
      nodes.push(node)
      continue
    }

    if (token.content) {
      nodes.push({ type: 'text', content: token.content })
    }
    index++
  }

  return nodes
}

export function parseInlineToken(token: Token | undefined): InlineNode[] {
  if (!token || token.type !== 'inline') return []
  return parseInlineChildren(token.children ?? [])
}
