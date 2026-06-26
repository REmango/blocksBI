import type MarkdownIt from 'markdown-it'
import type { Token } from 'markdown-it'

import { parseInlineToken } from './parseInline'
import type {
  ListItemBlock,
  MarkdownBlock,
  MarkdownBlockDraft,
  TableCellBlock,
  TableRowBlock,
} from './types'

function anchorOf(token: Token, fallback: number): number {
  return token.map?.[0] ?? fallback
}

function serializeTableRaw(header: TableRowBlock | null, rows: TableRowBlock[]): string {
  const serializeRow = (row: TableRowBlock) => row.cells.map((cell) => cell.raw).join('|')
  const lines: string[] = []
  if (header) lines.push(serializeRow(header))
  for (const row of rows) lines.push(serializeRow(row))
  return lines.join('\n')
}

function parseTableRow(tokens: Token[], start: number, cellTag: 'th_open' | 'td_open'): {
  row: TableRowBlock
  nextIndex: number
} {
  const cells: TableCellBlock[] = []
  let index = start

  while (index < tokens.length) {
    const token = tokens[index]
    if (token.type === 'tr_close') {
      return { row: { cells }, nextIndex: index + 1 }
    }

    if (token.type === cellTag) {
      const alignRaw = token.attrGet('style') ?? ''
      let align: TableCellBlock['align'] = null
      if (alignRaw.includes('center')) align = 'center'
      else if (alignRaw.includes('right')) align = 'right'
      else if (alignRaw.includes('left')) align = 'left'

      const inline = tokens[index + 1]
      cells.push({
        align,
        raw: inline?.content ?? '',
        inlines: parseInlineToken(inline),
      })
      index += 3
      continue
    }

    index++
  }

  return { row: { cells }, nextIndex: index }
}

function parseTable(tokens: Token[], start: number): { block: MarkdownBlockDraft; nextIndex: number } {
  let index = start + 1
  let header: TableRowBlock | null = null
  const rows: TableRowBlock[] = []

  while (index < tokens.length) {
    const token = tokens[index]
    if (token.type === 'table_close') break

    if (token.type === 'thead_open') {
      index++
      while (tokens[index]?.type !== 'thead_close') {
        if (tokens[index]?.type === 'tr_open') {
          const parsed = parseTableRow(tokens, index + 1, 'th_open')
          header = parsed.row
          index = parsed.nextIndex
          continue
        }
        index++
      }
      index++
      continue
    }

    if (token.type === 'tbody_open') {
      index++
      while (tokens[index]?.type !== 'tbody_close') {
        if (tokens[index]?.type === 'tr_open') {
          const parsed = parseTableRow(tokens, index + 1, 'td_open')
          rows.push(parsed.row)
          index = parsed.nextIndex
          continue
        }
        index++
      }
      index++
      continue
    }

    index++
  }

  return {
    block: {
      type: 'table',
      anchor: anchorOf(tokens[start], start),
      raw: serializeTableRaw(header, rows),
      header,
      rows,
    },
    nextIndex: index + 1,
  }
}

function parseListItemContent(tokens: Token[], start: number): { item: ListItemBlock; nextIndex: number } {
  let index = start
  const inlines = []
  let raw = ''

  while (index < tokens.length && tokens[index].type !== 'list_item_close') {
    const token = tokens[index]
    if (token.type === 'paragraph_open') {
      const inline = tokens[index + 1]
      raw = inline?.content ?? ''
      inlines.push(...parseInlineToken(inline))
      index += 3
      continue
    }
    if (token.type === 'inline') {
      raw = token.content
      inlines.push(...parseInlineToken(token))
      index++
      continue
    }
    index++
  }

  return { item: { raw, inlines }, nextIndex: index + 1 }
}

function parseList(tokens: Token[], start: number): { block: MarkdownBlockDraft; nextIndex: number } {
  const open = tokens[start]
  const ordered = open.type === 'ordered_list_open'
  const startNumber = ordered ? Number(open.attrGet('start') ?? 1) : 1
  const items: ListItemBlock[] = []
  let index = start + 1

  while (index < tokens.length) {
    const closeType = ordered ? 'ordered_list_close' : 'bullet_list_close'
    if (tokens[index].type === closeType) break

    if (tokens[index].type === 'list_item_open') {
      const parsed = parseListItemContent(tokens, index + 1)
      items.push(parsed.item)
      index = parsed.nextIndex
      continue
    }

    index++
  }

  return {
    block: {
      type: 'list',
      anchor: anchorOf(open, start),
      raw: items.map((item) => item.raw).join('\n'),
      ordered,
      start: startNumber,
      items,
    },
    nextIndex: index + 1,
  }
}

function parseBlockquote(tokens: Token[], start: number): { block: MarkdownBlockDraft; nextIndex: number } {
  let index = start + 1
  let depth = 1
  const innerStart = index

  while (index < tokens.length && depth > 0) {
    if (tokens[index].type === 'blockquote_open') depth++
    if (tokens[index].type === 'blockquote_close') {
      depth--
      if (depth === 0) break
    }
    index++
  }

  const innerTokens = tokens.slice(innerStart, index)
  const children = parseTokenBlocks(innerTokens, anchorOf(tokens[start], start))

  return {
    block: {
      type: 'blockquote',
      anchor: anchorOf(tokens[start], start),
      raw: children.map((child) => child.raw).join('\n'),
      children: assignStableIds(children, []),
    },
    nextIndex: index + 1,
  }
}

export function assignStableIds(
  nextBlocks: MarkdownBlockDraft[],
  previousBlocks: MarkdownBlock[],
): MarkdownBlock[] {
  return nextBlocks.map((block, index) => {
    const previous = previousBlocks[index]
    if (previous && previous.type === block.type && previous.anchor === block.anchor) {
      if (previous.raw === block.raw) return previous
      return { ...block, id: previous.id }
    }

    const byAnchor = previousBlocks.find(
      (item) => item.type === block.type && item.anchor === block.anchor,
    )
    if (byAnchor) {
      if (byAnchor.raw === block.raw) return byAnchor
      return { ...block, id: byAnchor.id }
    }

    return { ...block, id: `${block.type}-${block.anchor}-${index}` }
  })
}

function parseTokenBlocks(tokens: Token[], anchorOffset = 0): MarkdownBlockDraft[] {
  const blocks: MarkdownBlockDraft[] = []
  let index = 0

  while (index < tokens.length) {
    const token = tokens[index]

    if (token.type === 'fence' || token.type === 'code_block') {
      blocks.push({
        type: 'code',
        anchor: anchorOf(token, anchorOffset + index),
        raw: token.content,
        language:
          token.type === 'fence'
            ? token.info?.trim().split(/\s+/)[0] || 'plaintext'
            : 'plaintext',
        content: token.content.replace(/\n$/, ''),
      })
      index++
      continue
    }

    if (token.type === 'heading_open') {
      const inline = tokens[index + 1]
      blocks.push({
        type: 'heading',
        anchor: anchorOf(token, anchorOffset + index),
        raw: inline?.content ?? '',
        level: Number(token.tag.slice(1)) || 1,
        inlines: parseInlineToken(inline),
      })
      index += 3
      continue
    }

    if (token.type === 'paragraph_open') {
      const inline = tokens[index + 1]
      blocks.push({
        type: 'paragraph',
        anchor: anchorOf(token, anchorOffset + index),
        raw: inline?.content ?? '',
        inlines: parseInlineToken(inline),
      })
      index += 3
      continue
    }

    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      const parsed = parseList(tokens, index)
      blocks.push(parsed.block)
      index = parsed.nextIndex
      continue
    }

    if (token.type === 'table_open') {
      const parsed = parseTable(tokens, index)
      blocks.push(parsed.block)
      index = parsed.nextIndex
      continue
    }

    if (token.type === 'blockquote_open') {
      const parsed = parseBlockquote(tokens, index)
      blocks.push(parsed.block)
      index = parsed.nextIndex
      continue
    }

    if (token.type === 'hr') {
      blocks.push({ type: 'hr', anchor: anchorOf(token, anchorOffset + index), raw: '---' })
      index++
      continue
    }

    index++
  }

  return blocks
}

export function parseMarkdownBlocks(source: string, md: MarkdownIt): MarkdownBlockDraft[] {
  if (!source.trim()) return []
  return parseTokenBlocks(md.parse(source, {}))
}
