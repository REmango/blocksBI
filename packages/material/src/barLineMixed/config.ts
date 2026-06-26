import {
  getAxisNameConfig,
  getAxisLegendConfig,
  getAxisStyleConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import barLineMixedDemoData from '../demoData/barLineMixed'

const config = {
  siderConfig: {
    key: CARD_KEYS.BAR_LINE_MIXED,
    name: '柱状图+折线图',
    groupName: '混合图表',
    icon: 'icon-chart-line-full',
    description: '柱状图+折线图',
    componentName: 'chart',
  },

  styleConfig: [
    ...getTitleConfig(),
    ...getAxisNameConfig(),
    ...getAxisStyleConfig(),
    ...getAxisLegendConfig(),
    ...getAxisTooltipConfig(),
    ...getSeriesConfig(CARD_KEYS.BAR),
  ],

  dataConfig: barLineMixedDemoData,

  eventConfig: {},
}

export default config
