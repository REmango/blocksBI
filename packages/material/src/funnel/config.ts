import {
  getAxisLegendConfig,
  getAxisTooltipConfig,
  getTitleConfig,
  getSeriesConfig,
} from '../common/config'
import { CARD_KEYS } from '../constants'
import funnelDemoData from '../demoData/funnel'

const config = {
  siderConfig: {
    key: CARD_KEYS.FUNNEL,
    name: '漏斗图',
    groupName: '常用图表',
    icon: 'icon-huanxingtu',
    description: '漏斗图',
    componentName: 'chart',
  },

  styleConfig: [
    ...getTitleConfig(),
    ...getAxisLegendConfig(),
    ...getAxisTooltipConfig(),
    ...getSeriesConfig(CARD_KEYS.FUNNEL),
  ],

  dataConfig: funnelDemoData,

  eventConfig: {},
}

export default config
