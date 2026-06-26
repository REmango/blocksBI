import type { ZodTypeAny } from 'zod'

export class ToolValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message)
    this.name = 'ToolValidationError'
  }
}

/** Validate tool input against its Zod schema before remote dispatch. */
export function validateToolInput<T>(schema: ZodTypeAny, input: unknown, toolName: string): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]
    const field = issue?.path.join('.') || undefined
    throw new ToolValidationError(
      `Invalid parameters for ${toolName}: ${issue?.message ?? 'validation failed'}`,
      field,
    )
  }
  return result.data as T
}

/** Attempt to auto-correct common parameter mistakes. */
export function tryAutoCorrectInput(
  toolName: string,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const corrected = { ...input }

  if ('componentId' in corrected && typeof corrected.componentId === 'string') {
    corrected.componentId = corrected.componentId.trim()
  }
  if ('componentIds' in corrected && Array.isArray(corrected.componentIds)) {
    corrected.componentIds = corrected.componentIds.map((id) =>
      typeof id === 'string' ? id.trim() : id,
    )
  }
  if ('pageIndex' in corrected && typeof corrected.pageIndex === 'string') {
    const parsed = Number(corrected.pageIndex)
    if (!Number.isNaN(parsed)) corrected.pageIndex = parsed
  }

  if ('items' in corrected && Array.isArray(corrected.items)) {
    corrected.items = corrected.items.map((item) => {
      if (!item || typeof item !== 'object') return item
      const row = { ...(item as Record<string, unknown>) }
      if (typeof row.componentId === 'string') row.componentId = row.componentId.trim()
      return row
    })
  }

  return corrected
}
