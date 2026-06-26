import bar from './bar'
import line from './line'
import pie from './pie'
import scatter from './scatter'
import funnel from './funnel'
import { CARD_KEYS } from '../../../../constants'
import { updateConfig } from '../../../../utils'

export const seriesConfig = {
  [CARD_KEYS.LINE]: line,
  [CARD_KEYS.BAR]: bar,
  [CARD_KEYS.PIE]: pie,
  [CARD_KEYS.SCATTER]: scatter,
  [CARD_KEYS.FUNNEL]: funnel,
}

export function getSeriesConfig(key: keyof typeof seriesConfig, config?: Record<string, any>) {
  const currentConfig = seriesConfig[key] ?? {}
  return updateConfig(currentConfig, config)
}
