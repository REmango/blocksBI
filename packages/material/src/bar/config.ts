import {
  getAxisNameConfig,
  getAxisLegendConfig,
  getAxisStyleConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import barDemoData from '../demoData/bar'

const config = {
  siderConfig: {
    key: CARD_KEYS.BAR,
    name: '柱状图',
    groupName: '常用图表',
    icon: 'icon-tubiao-zhuzhuangtu',
    description: '柱状图',
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

  dataConfig: barDemoData,

  eventConfig: {},
}

export default config
