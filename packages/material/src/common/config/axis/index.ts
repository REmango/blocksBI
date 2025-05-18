import { IChartConfig } from '../../../types/chart'
import { updateConfig } from '../../../utils'

import style from './style'
import name from './name'
import legend from './legend'
import tooltip from './tooltip'

export function getAxisStyleConfig(config?: Record<string, any>) {
  return updateConfig(style, config)
}

export function getAxisNameConfig(config?: Record<string, any>) {
  return updateConfig(name, config)
}

export function getAxisLegendConfig(config?: Record<string, any>) {
  return updateConfig(legend, config)
}

export function getAxisTooltipConfig(config?: Record<string, any>) {
  return updateConfig(tooltip, config)
}
