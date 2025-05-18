import { CARD_KEYS } from '../constants'

import { getTitleConfig } from '../common/config'

const config = {
  siderConfig: {
    key: CARD_KEYS.BAR,
    name: '柱状图',
    groupName: '常用图表',
    icon: 'icon-tubiao-zhuzhuangtu',
    description: '柱状图',
    componentName: 'chart',
  },

  styleConfig: [...getTitleConfig()],

  dataConfig: {},

  eventConfig: {},
}

export default config
