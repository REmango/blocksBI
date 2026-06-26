import type { Tool } from 'ai'
import { tool } from 'ai'
import type { ZodTypeAny } from 'zod'

/** BI tool category for permission grouping. */
export type BiToolCategory = 'metadata' | 'layout' | 'page'

/** Whether a tool mutates the canvas. */
export type BiToolMutability = 'read' | 'write'

export interface BiToolDefinition {
  name: string
  category: BiToolCategory
  mutability: BiToolMutability
  /** AI SDK tool schema — no execute; dispatched via remote WS executor. */
  tool: Tool
  /** Zod schema for pre-dispatch validation. */
  inputSchema: ZodTypeAny
}

/** Tools that mutate layout on the canvas. */
export const MUTATING_TOOLS = new Set([
  'bi_move_components',
  'bi_resize_components',
  'bi_align_components',
  'bi_distribute_components',
  'bi_adjust_component_margin',
  'bi_set_component_visible',
  'bi_adjust_component_z_index',
  'bi_layout_grid_arrange',
  'createPage',
  'switchPage',
  'renamePage',
])

export function isMutatingTool(toolName: string): boolean {
  return MUTATING_TOOLS.has(toolName)
}

/** Helper to define a BI tool with shared schema for AI SDK + validation. */
export function defineBiTool(def: {
  name: string
  category: BiToolCategory
  mutability: BiToolMutability
  description: string
  inputSchema: ZodTypeAny
}): BiToolDefinition {
  return {
    name: def.name,
    category: def.category,
    mutability: def.mutability,
    inputSchema: def.inputSchema,
    tool: tool({
      description: def.description,
      inputSchema: def.inputSchema,
    }),
  }
}
