import line from './line'
import { CARD_KEYS } from '../../../../constants'
import { updateConfig } from '../../../../utils'

export const seriesConfig = {
  [CARD_KEYS.LINE]: line,
}

export function getSeriesConfig(key: keyof typeof seriesConfig, config?: Record<string, any>) {
  const currentConfig = seriesConfig[key] ?? {}
  return updateConfig(currentConfig, config)
}
