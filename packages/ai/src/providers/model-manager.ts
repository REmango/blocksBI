import type { LanguageModel } from 'ai'

import {
  listConfiguredProviderModels,
  normalizeModelId,
  type ProviderModel,
} from './catalog'
import {
  getAvailableProviders,
  resolveModelId,
  saveBiConfig,
} from './config'
import { createBiModelRegistry, type BiModelRegistry } from './registry'

export interface ModelSwitchResult {
  previousModelId: string
  modelId: string
  model: LanguageModel
}

/**
 * Unified model management — resolve, switch, and obtain LanguageModel instances.
 * Mirrors packages/core's modelRegistry + resolveModelId pattern for BI server use.
 */
export class BiModelManager {
  private currentModelId: string

  constructor(
    private readonly registry: BiModelRegistry,
    modelId?: string,
  ) {
    const resolved = resolveModelId(modelId)
    if (!resolved) {
      throw new Error(
        'No model configured. Set BLOCKSBI_MODEL or a provider API key (e.g. DEEPSEEK_API_KEY).',
      )
    }
    this.currentModelId = resolved
  }

  static create(modelId?: string, registry?: BiModelRegistry): BiModelManager {
    return new BiModelManager(registry ?? createBiModelRegistry(), modelId)
  }

  getRegistry(): BiModelRegistry {
    return this.registry
  }

  getModelId(): string {
    return this.currentModelId
  }

  getModel(): LanguageModel {
    return this.registry.languageModel(this.currentModelId as `${string}:${string}`)
  }

  /** Switch model by full id or alias (e.g. `deepseek`, `anthropic:claude-sonnet-4-6`). */
  switchModel(input: string, persist = true): ModelSwitchResult {
    const modelId = resolveModelId(input) ?? normalizeModelId(input)
    if (!modelId.includes(':')) {
      throw new Error(`Unknown model: ${input}`)
    }

    const previousModelId = this.currentModelId
    this.currentModelId = modelId

    if (persist) {
      saveBiConfig({ model: modelId })
    }

    return {
      previousModelId,
      modelId,
      model: this.getModel(),
    }
  }

  listAvailableProviders(): string[] {
    return getAvailableProviders()
  }

  listCatalog(): ProviderModel[] {
    return listConfiguredProviderModels(this.listAvailableProviders())
  }

  resolve(input?: string): string | null {
    return resolveModelId(input)
  }
}

/** Apply a model switch to loop state — invalidates system prompt cache. */
export function applyModelSwitch(
  state: { modelId: string; systemPromptCache: string | null; expectCacheMiss: boolean },
  result: ModelSwitchResult,
): void {
  state.modelId = result.modelId
  state.systemPromptCache = null
  state.expectCacheMiss = true
}
