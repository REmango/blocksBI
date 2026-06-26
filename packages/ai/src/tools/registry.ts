import type { Tool } from 'ai'

import * as layoutTools from './layout'
import * as metadataTools from './metadata'
import * as pageTools from './page'
import type { BiToolDefinition } from './types'

const allDefinitions: BiToolDefinition[] = [
  metadataTools.biGetCanvasMeta,
  metadataTools.biListAllComponents,
  metadataTools.biSearchComponentByName,
  metadataTools.biGetSingleComponentDetail,
  metadataTools.biGetCurrentChartData,
  metadataTools.biGetSelectedComponents,
  layoutTools.biMoveComponents,
  layoutTools.biResizeComponents,
  layoutTools.biAlignComponents,
  layoutTools.biDistributeComponents,
  layoutTools.biAdjustComponentMargin,
  layoutTools.biSetComponentVisible,
  layoutTools.biAdjustComponentZIndex,
  layoutTools.biLayoutGridArrange,
  pageTools.createPage,
  pageTools.switchPage,
  pageTools.renamePage,
]

/** BI layout tool registry — no CLI file/shell tools. */
export const biToolRegistry: Record<string, BiToolDefinition> = Object.fromEntries(
  allDefinitions.map((def) => [def.name, def]),
)

export function buildBiToolSet(filter?: {
  allowList?: string[]
  denyList?: string[]
}): Record<string, Tool> {
  const tools: Record<string, Tool> = {}
  for (const def of allDefinitions) {
    if (filter?.denyList?.includes(def.name)) continue
    if (filter?.allowList && filter.allowList.length > 0 && !filter.allowList.includes(def.name)) {
      continue
    }
    tools[def.name] = def.tool
  }

  return tools
}

export function listBiToolNames(): string[] {
  return allDefinitions.map((d) => d.name)
}

export { metadataTools, layoutTools, pageTools }

export type { BiToolDefinition, BiToolCategory, BiToolMutability } from './types'
export { isMutatingTool, MUTATING_TOOLS } from './types'
export { validateToolInput, tryAutoCorrectInput, ToolValidationError } from './validation'
export {
  createPermissionHook,
  createAuditHook,
  ToolHookRunner,
  getToolDefinition,
} from './hooks'

export { ToolRegistry, toolRegistry } from './tool-registry'
export { resolveRemoteExecutor } from './resolve-executor'
