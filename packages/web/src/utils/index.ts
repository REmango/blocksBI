import { nanoid } from 'nanoid'

import { configMap } from '@block-bi/material'

export function generateId() {
  return nanoid()
}

export function getCardDefaultConfig(cardKey: string) {
  const config = configMap[cardKey as keyof typeof configMap]
  if (!config) return undefined
  return structuredClone(config)
}
