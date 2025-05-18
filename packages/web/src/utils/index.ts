import { nanoid } from 'nanoid'

import { configMap } from '@block-bi/material'

export function generateId() {
  return nanoid()
}

export function getCardDefaultConfig(cardKey: string) {
  return configMap[cardKey as keyof typeof configMap]
}
