import { z } from 'zod'

import { defineBiTool } from '../types'

const componentId = z.string().min(1).describe('Exact component ID from search/list tools')

export const biGetCanvasMeta = defineBiTool({
  name: 'bi_get_canvas_meta',
  category: 'metadata',
  mutability: 'read',
  description:
    'Get current canvas metadata: size, view mode, page info, and advanced display settings. Call before layout operations to respect bounds.',
  inputSchema: z.object({}),
})

export const biListAllComponents = defineBiTool({
  name: 'bi_list_all_components',
  category: 'metadata',
  mutability: 'read',
  description:
    'List all components on the canvas (charts, cards, tables, filters, layout containers) with id, type, position, size, z-index, visibility, and data binding summary.',
  inputSchema: z.object({
    pageIndex: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Page index; omit to use current page, -1 means all pages via allPages flag'),
    allPages: z.boolean().optional().describe('When true, list components across every page'),
  }),
})

export const biSearchComponentByName = defineBiTool({
  name: 'bi_search_component_by_name',
  category: 'metadata',
  mutability: 'read',
  description:
    'Fuzzy search components by name or description. REQUIRED before referencing components by vague name — never invent IDs.',
  inputSchema: z.object({
    keyword: z.string().min(1).describe('Search keyword'),
    componentType: z
      .string()
      .optional()
      .describe('Filter by component type, e.g. chart, layoutContainer'),
    pageIndex: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
})

export const biGetSingleComponentDetail = defineBiTool({
  name: 'bi_get_single_component_detail',
  category: 'metadata',
  mutability: 'read',
  description:
    'Get full configuration for one component: style, data dimensions, filters, position, layer, and chart props.',
  inputSchema: z.object({
    componentId,
  }),
})

export const biGetCurrentChartData = defineBiTool({
  name: 'bi_get_current_chart_data',
  category: 'metadata',
  mutability: 'read',
  description:
    'Read live chart data binding and dataset config from the canvas store. Use for data analysis before layout changes.',
  inputSchema: z.object({
    componentId: componentId.optional().describe('Specific chart; omit to return all charts on current page'),
    pageIndex: z.number().int().min(0).optional(),
  }),
})

export const biGetSelectedComponents = defineBiTool({
  name: 'bi_get_selected_components',
  category: 'metadata',
  mutability: 'read',
  description:
    'Get the component currently selected by the user in the canvas editor (click/focus). Use when the user refers to "this component", "selected chart", or the focused item without naming it.',
  inputSchema: z.object({
    includeDetail: z
      .boolean()
      .optional()
      .default(true)
      .describe('When true (default), return full config; when false, layout summary only'),
  }),
})
