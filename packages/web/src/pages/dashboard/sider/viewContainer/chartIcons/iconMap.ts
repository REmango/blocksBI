import { CARD_KEYS } from '@block-bi/material'

import barIcon from './icons/bar.svg?raw'
import barLineMixedIcon from './icons/bar-line-mixed.svg?raw'
import funnelIcon from './icons/funnel.svg?raw'
import lineIcon from './icons/line.svg?raw'
import pieIcon from './icons/pie.svg?raw'
import scatterIcon from './icons/scatter.svg?raw'

export const CHART_GROUP_NAME = '常用图表'
export const MIXED_CHART_GROUP_NAME = '混合图表'

export const chartIconMap: Record<string, string> = {
  [CARD_KEYS.LINE]: lineIcon,
  [CARD_KEYS.BAR]: barIcon,
  [CARD_KEYS.PIE]: pieIcon,
  [CARD_KEYS.SCATTER]: scatterIcon,
  [CARD_KEYS.FUNNEL]: funnelIcon,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixedIcon,
}

export const isChartPaletteItem = (groupName: string, itemKey: string) =>
  (groupName === CHART_GROUP_NAME || groupName === MIXED_CHART_GROUP_NAME) &&
  itemKey in chartIconMap
