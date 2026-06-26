import { z } from 'zod'

import { defineBiTool } from '../types'

const componentId = z.string().min(1).describe('Exact component ID')

const moveItem = z.object({
  componentId,
  x: z.number().optional().describe('Absolute X in pixels'),
  y: z.number().optional().describe('Absolute Y in pixels'),
  offsetX: z.number().optional().describe('Relative X offset'),
  offsetY: z.number().optional().describe('Relative Y offset'),
})

const resizeItem = z.object({
  componentId,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  keepAspectRatio: z.boolean().optional().default(false),
})

const visibilityItem = z.object({
  componentId,
  visible: z.boolean(),
})

const zIndexItem = z.object({
  componentId,
  action: z.enum(['bringToFront', 'sendToBack', 'bringForward', 'sendBackward']),
})

export const biMoveComponents = defineBiTool({
  name: 'bi_move_components',
  category: 'layout',
  mutability: 'write',
  description: 'Batch move components by absolute coordinates or relative offset.',
  inputSchema: z.object({
    items: z.array(moveItem).min(1),
  }),
})

export const biResizeComponents = defineBiTool({
  name: 'bi_resize_components',
  category: 'layout',
  mutability: 'write',
  description: 'Batch resize components; optional proportional scaling.',
  inputSchema: z.object({
    items: z.array(resizeItem).min(1),
  }),
})

export const biAlignComponents = defineBiTool({
  name: 'bi_align_components',
  category: 'layout',
  mutability: 'write',
  description:
    'Align multiple components: left, right, top, bottom, center (horizontal), middle (vertical). Optional reference component.',
  inputSchema: z.object({
    componentIds: z.array(componentId).min(2),
    alignment: z.enum(['left', 'right', 'top', 'bottom', 'center', 'middle']),
    referenceComponentId: componentId.optional(),
  }),
})

export const biDistributeComponents = defineBiTool({
  name: 'bi_distribute_components',
  category: 'layout',
  mutability: 'write',
  description: 'Evenly distribute components horizontally or vertically with equal spacing.',
  inputSchema: z.object({
    componentIds: z.array(componentId).min(3),
    direction: z.enum(['horizontal', 'vertical']),
  }),
})

export const biAdjustComponentMargin = defineBiTool({
  name: 'bi_adjust_component_margin',
  category: 'layout',
  mutability: 'write',
  description: 'Add spacing between components to reduce overlap (expands gaps in sort order).',
  inputSchema: z.object({
    componentIds: z.array(componentId).min(2),
    margin: z.number().min(0).describe('Extra gap in pixels between adjacent components'),
    direction: z.enum(['horizontal', 'vertical']).optional().default('horizontal'),
  }),
})

export const biSetComponentVisible = defineBiTool({
  name: 'bi_set_component_visible',
  category: 'layout',
  mutability: 'write',
  description: 'Batch show or hide components on the canvas.',
  inputSchema: z.object({
    items: z.array(visibilityItem).min(1),
  }),
})

export const biAdjustComponentZIndex = defineBiTool({
  name: 'bi_adjust_component_z_index',
  category: 'layout',
  mutability: 'write',
  description: 'Adjust z-index / layer order: bringToFront, sendToBack, bringForward, sendBackward.',
  inputSchema: z.object({
    items: z.array(zIndexItem).min(1),
  }),
})

export const biLayoutGridArrange = defineBiTool({
  name: 'bi_layout_grid_arrange',
  category: 'layout',
  mutability: 'write',
  description: 'Arrange components in an N×M grid with configurable gaps and margins.',
  inputSchema: z.object({
    componentIds: z.array(componentId).min(1),
    rows: z.number().int().min(1).max(12),
    columns: z.number().int().min(1).max(12),
    gapX: z.number().min(0).optional().default(16),
    gapY: z.number().min(0).optional().default(16),
    marginX: z.number().min(0).optional().default(0),
    marginY: z.number().min(0).optional().default(0),
    startX: z.number().optional(),
    startY: z.number().optional(),
  }),
})
