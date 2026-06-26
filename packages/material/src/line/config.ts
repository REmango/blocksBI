import {
  getAxisNameConfig,
  getAxisLegendConfig,
  getAxisStyleConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import lineDemoData from '../demoData/line'

const config = {
  siderConfig: {
    key: CARD_KEYS.LINE,
    name: '折线图',
    groupName: '常用图表',
    icon: 'icon-tubiao-zhexiantu',
    description: '折线图',
    componentName: 'chart',
  },

  styleConfig: [
    ...getTitleConfig(),
    ...getAxisNameConfig(),
    ...getAxisStyleConfig(),
    ...getAxisLegendConfig(),
    ...getAxisTooltipConfig(),
    ...getSeriesConfig(CARD_KEYS.LINE),
  ],

  dataConfig: lineDemoData,

  eventConfig: {},
}

export default config
