import { z } from 'zod'

import { defineBiTool } from '../types'

export const createPage = defineBiTool({
  name: 'createPage',
  category: 'page',
  mutability: 'write',
  description: 'Create a new page/tab in the dashboard.',
  inputSchema: z.object({
    name: z.string().min(1).max(50),
  }),
})

export const switchPage = defineBiTool({
  name: 'switchPage',
  category: 'page',
  mutability: 'write',
  description: 'Switch the active page to the given index.',
  inputSchema: z.object({
    pageIndex: z.number().int().min(0),
  }),
})

export const renamePage = defineBiTool({
  name: 'renamePage',
  category: 'page',
  mutability: 'write',
  description: 'Rename an existing page.',
  inputSchema: z.object({
    pageIndex: z.number().int().min(0),
    name: z.string().min(1).max(50),
  }),
})
