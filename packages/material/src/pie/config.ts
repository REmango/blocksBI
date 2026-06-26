import {
  getAxisLegendConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import pieDemoData from '../demoData/pie'

const config = {
  siderConfig: {
    key: CARD_KEYS.PIE,
    name: '饼图',
    groupName: '常用图表',
    icon: 'icon-bingzhuangtu',
    description: '饼图',
    componentName: 'chart',
  },

  styleConfig: [
    ...getTitleConfig(),
    ...getAxisLegendConfig(),
    ...getAxisTooltipConfig(),
    ...getSeriesConfig(CARD_KEYS.PIE),
  ],

  dataConfig: pieDemoData,

  eventConfig: {},
}

export default config
