export {
  MODEL_ALIASES,
  PROVIDER_DETECTION_ORDER,
  PROVIDER_MODELS,
  PROVIDER_KEY_URLS,
  normalizeModelId,
  listConfiguredProviderModels,
} from './catalog'
export type { ProviderModel } from './catalog'

export {
  resolveModelId,
  getAvailableProviders,
  getEnvVarName,
  getProviderOptions,
  loadBiConfig,
  saveBiConfig,
} from './config'
export type { BiUserConfig } from './config'

export { createBiModelRegistry } from './registry'
export type { BiModelRegistry } from './registry'

export { BiModelManager, applyModelSwitch } from './model-manager'
export type { ModelSwitchResult } from './model-manager'
