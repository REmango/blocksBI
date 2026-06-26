import {
  getAxisNameConfig,
  getAxisLegendConfig,
  getAxisStyleConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import scatterDemoData from '../demoData/scatter'

const config = {
  siderConfig: {
    key: CARD_KEYS.SCATTER,
    name: '散点图',
    groupName: '常用图表',
    icon: 'icon-sandiantu',
    description: '散点图',
    componentName: 'chart',
  },

  styleConfig: [
    ...getTitleConfig(),
    ...getAxisNameConfig(),
    ...getAxisStyleConfig(),
    ...getAxisLegendConfig(),
    ...getAxisTooltipConfig(),
    ...getSeriesConfig(CARD_KEYS.SCATTER),
  ],

  dataConfig: scatterDemoData,

  eventConfig: {},
}

export default config
