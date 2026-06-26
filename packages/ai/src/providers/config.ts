import * as fs from 'node:fs'
import * as path from 'node:path'

import { MODEL_ALIASES, normalizeModelId, PROVIDER_DETECTION_ORDER } from './catalog'

const ENV_MAP: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  xai: 'XAI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  alibaba: 'ALIBABA_API_KEY',
  zhipu: 'ZHIPU_API_KEY',
  moonshotai: 'MOONSHOT_API_KEY',
}

function getApiKey(provider: string): string | undefined {
  const envKey = ENV_MAP[provider]
  return envKey ? process.env[envKey] : undefined
}

export function getEnvVarName(provider: string): string | undefined {
  return ENV_MAP[provider]
}

export function getAvailableProviders(): string[] {
  const providers = Object.keys(ENV_MAP).filter((p) => getApiKey(p))
  if (process.env.OPENAI_COMPATIBLE_API_KEY && process.env.OPENAI_COMPATIBLE_BASE_URL) {
    providers.push('custom')
  }
  return providers
}

export interface BiUserConfig {
  model?: string
}

function configPath(): string {
  if (process.env.BLOCKSBI_CONFIG_PATH) {
    return process.env.BLOCKSBI_CONFIG_PATH
  }
  return path.join(process.cwd(), '.blocksbi', 'config.json')
}

export function loadBiConfig(): BiUserConfig {
  try {
    const raw = fs.readFileSync(configPath(), 'utf-8')
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as BiUserConfig
    }
  } catch {
    // missing or invalid — fall through
  }
  return {}
}

export function saveBiConfig(update: Partial<BiUserConfig>): void {
  const merged: BiUserConfig = { ...loadBiConfig(), ...update }
  try {
    fs.mkdirSync(path.dirname(configPath()), { recursive: true })
    fs.writeFileSync(configPath(), JSON.stringify(merged, null, 2) + '\n', 'utf-8')
  } catch {
    // best-effort
  }
}

/**
 * Resolve model id with precedence:
 * 1. Explicit input
 * 2. `.blocksbi/config.json` model field (or BLOCKSBI_CONFIG_PATH)
 * 3. BLOCKSBI_MODEL env
 * 4. First provider with API key (PROVIDER_DETECTION_ORDER)
 */
export function resolveModelId(input?: string): string | null {
  const explicit = input ?? loadBiConfig().model ?? process.env.BLOCKSBI_MODEL
  if (explicit) {
    return normalizeModelId(explicit)
  }

  for (const { envKey, defaultModel } of PROVIDER_DETECTION_ORDER) {
    if (process.env[envKey]) return defaultModel
  }

  if (process.env.OPENAI_COMPATIBLE_API_KEY && process.env.OPENAI_COMPATIBLE_BASE_URL) {
    return process.env.BLOCKSBI_CUSTOM_MODEL ?? 'custom:default'
  }

  return null
}

export function getProviderOptions() {
  return {
    anthropic: getApiKey('anthropic'),
    openai: getApiKey('openai'),
    google: getApiKey('google'),
    xai: getApiKey('xai'),
    deepseek: getApiKey('deepseek'),
    alibaba: getApiKey('alibaba'),
    zhipu: getApiKey('zhipu'),
    moonshotai: getApiKey('moonshotai'),
    custom: {
      apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
      baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL,
    },
  }
}

export { MODEL_ALIASES }
