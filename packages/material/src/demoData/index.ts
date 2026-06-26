import { CARD_KEYS } from '../constants'
import { ChartData } from '../types/chart'

import barDemoData from './bar'
import barLineMixedDemoData from './barLineMixed'
import lineDemoData from './line'
import pieDemoData from './pie'
import scatterDemoData from './scatter'
import funnelDemoData from './funnel'

const demoData: Record<string, ChartData> = {
  [CARD_KEYS.LINE]: lineDemoData,
  [CARD_KEYS.BAR]: barDemoData,
  [CARD_KEYS.PIE]: pieDemoData,
  [CARD_KEYS.SCATTER]: scatterDemoData,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixedDemoData,
  [CARD_KEYS.FUNNEL]: funnelDemoData,
}

export default demoData
