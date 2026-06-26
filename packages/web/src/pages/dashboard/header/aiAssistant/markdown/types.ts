export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'list'
  | 'table'
  | 'blockquote'
  | 'hr'

export type InlineNodeType =
  | 'text'
  | 'link'
  | 'code'
  | 'strong'
  | 'em'
  | 'break'

export interface InlineNode {
  type: InlineNodeType
  content?: string
  href?: string
  children?: InlineNode[]
}

export interface ListItemBlock {
  inlines: InlineNode[]
  raw: string
}

export interface TableCellBlock {
  inlines: InlineNode[]
  raw: string
  align: 'left' | 'center' | 'right' | null
}

export interface TableRowBlock {
  cells: TableCellBlock[]
}

export interface MarkdownBlockBase {
  id: string
  type: BlockType
  /** Stable anchor — usually source line index from markdown-it token map. */
  anchor: number
  raw: string
}

export interface ParagraphBlockData extends MarkdownBlockBase {
  type: 'paragraph'
  inlines: InlineNode[]
}

export interface HeadingBlockData extends MarkdownBlockBase {
  type: 'heading'
  level: number
  inlines: InlineNode[]
}

export interface CodeBlockData extends MarkdownBlockBase {
  type: 'code'
  language: string
  content: string
  isPartial?: boolean
}

export interface ListBlockData extends MarkdownBlockBase {
  type: 'list'
  ordered: boolean
  start: number
  items: ListItemBlock[]
}

export interface TableBlockData extends MarkdownBlockBase {
  type: 'table'
  header: TableRowBlock | null
  rows: TableRowBlock[]
}

export interface BlockquoteBlockData extends MarkdownBlockBase {
  type: 'blockquote'
  children: MarkdownBlock[]
}

export interface HrBlockData extends MarkdownBlockBase {
  type: 'hr'
}

export type MarkdownBlock =
  | ParagraphBlockData
  | HeadingBlockData
  | CodeBlockData
  | ListBlockData
  | TableBlockData
  | BlockquoteBlockData
  | HrBlockData

export type MarkdownBlockDraft = Omit<MarkdownBlock, 'id'>
