/** Full `<provider>:<model>` id passed to AI SDK. */
export interface ProviderModel {
  id: string
  label: string
  description: string
}

export const MODEL_ALIASES: Record<string, string> = {
  sonnet: 'anthropic:claude-sonnet-4-6',
  opus: 'anthropic:claude-opus-4-7',
  haiku: 'anthropic:claude-haiku-4-5',
  gpt4: 'openai:gpt-4.1',
  gemini: 'google:gemini-2.5-pro',
  deepseek: 'deepseek:deepseek-v4-flash',
  'deepseek-pro': 'deepseek:deepseek-v4-pro',
  qwen: 'alibaba:qwen-max',
  glm: 'zhipu:glm-4-plus',
  kimi: 'moonshotai:kimi-k2.5',
}

export const PROVIDER_DETECTION_ORDER = [
  { envKey: 'DEEPSEEK_API_KEY', defaultModel: 'deepseek:deepseek-v4-flash' },
  { envKey: 'ANTHROPIC_API_KEY', defaultModel: 'anthropic:claude-sonnet-4-6' },
  { envKey: 'OPENAI_API_KEY', defaultModel: 'openai:gpt-4.1' },
  { envKey: 'ALIBABA_API_KEY', defaultModel: 'alibaba:qwen-max' },
  { envKey: 'GOOGLE_GENERATIVE_AI_API_KEY', defaultModel: 'google:gemini-2.5-pro' },
  { envKey: 'XAI_API_KEY', defaultModel: 'xai:grok-3' },
  { envKey: 'ZHIPU_API_KEY', defaultModel: 'zhipu:glm-4-plus' },
  { envKey: 'MOONSHOT_API_KEY', defaultModel: 'moonshotai:kimi-k2.5' },
] as const

export const PROVIDER_MODELS: Record<string, readonly ProviderModel[]> = {
  anthropic: [
    {
      id: 'anthropic:claude-sonnet-4-6',
      label: 'Sonnet 4.6',
      description: 'Balanced default — good for reasoning, 1M context',
    },
    {
      id: 'anthropic:claude-opus-4-7',
      label: 'Opus 4.7',
      description: 'Most capable, strongest agentic performance, 1M context',
    },
    {
      id: 'anthropic:claude-haiku-4-5',
      label: 'Haiku 4.5',
      description: 'Fastest, cheapest',
    },
  ],
  openai: [
    { id: 'openai:gpt-4.1', label: 'GPT-4.1', description: 'General-purpose, 1M context' },
    { id: 'openai:gpt-4.1-mini', label: 'GPT-4.1 Mini', description: 'Cheaper 4.1 tier' },
    { id: 'openai:o3', label: 'o3', description: 'Reasoning model' },
    { id: 'openai:o4-mini', label: 'o4-mini', description: 'Smaller reasoning model' },
  ],
  deepseek: [
    {
      id: 'deepseek:deepseek-v4-flash',
      label: 'DeepSeek V4 Flash',
      description: 'Fast general-purpose, 1M context',
    },
    {
      id: 'deepseek:deepseek-v4-pro',
      label: 'DeepSeek V4 Pro',
      description: 'Flagship reasoning, 1M context',
    },
  ],
  alibaba: [
    { id: 'alibaba:qwen-max', label: 'Qwen Max', description: 'Strongest general Qwen' },
    { id: 'alibaba:qwen-plus', label: 'Qwen Plus', description: 'Balanced cost/quality' },
    { id: 'alibaba:qwen-turbo', label: 'Qwen Turbo', description: 'Cheapest, fast' },
    { id: 'alibaba:qwen3-max', label: 'Qwen3 Max', description: 'Latest flagship' },
    {
      id: 'alibaba:qwen3-coder-plus',
      label: 'Qwen3 Coder Plus',
      description: 'Tuned for structured tasks',
    },
  ],
  google: [
    { id: 'google:gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: '1M context' },
    { id: 'google:gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Cheaper/faster' },
  ],
  xai: [
    { id: 'xai:grok-3', label: 'Grok 3', description: '131k context' },
    { id: 'xai:grok-3-mini', label: 'Grok 3 Mini', description: 'Smaller variant' },
  ],
  zhipu: [{ id: 'zhipu:glm-4-plus', label: 'GLM-4 Plus', description: '128k context' }],
  moonshotai: [{ id: 'moonshotai:kimi-k2.5', label: 'Kimi K2.5', description: '131k context' }],
}

export const PROVIDER_KEY_URLS: Record<string, string> = {
  anthropic: 'https://console.anthropic.com/',
  openai: 'https://platform.openai.com/api-keys',
  google: 'https://aistudio.google.com/apikey',
  xai: 'https://console.x.ai/',
  deepseek: 'https://platform.deepseek.com/api_keys',
  alibaba: 'https://dashscope.console.aliyun.com/apiKey',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
  moonshotai: 'https://platform.moonshot.ai/console/api-keys',
}

/** Expand alias or validate model id format `provider:model`. */
export function normalizeModelId(input: string): string {
  const trimmed = input.trim()
  return MODEL_ALIASES[trimmed] ?? trimmed
}

/** List catalog entries for providers that have API keys configured. */
export function listConfiguredProviderModels(availableProviders: string[]): ProviderModel[] {
  const out: ProviderModel[] = []
  for (const provider of availableProviders) {
    const models = PROVIDER_MODELS[provider]
    if (models) out.push(...models)
  }
  return out
}
