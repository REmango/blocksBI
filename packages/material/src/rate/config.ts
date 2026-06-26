import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.RATE,
    name: '评分',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '评分',
    componentName: 'rate',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'defaultValue',
      label: '默认分值',
      groupName: '评分',
      componentName: COMPONENT_NAME.INPUT_NUMBER,
      col: 12,
      layout: 'vertical',
      defaultValue: 3,
    },
    {
      key: 'count',
      label: '星星数量',
      groupName: '评分',
      componentName: COMPONENT_NAME.INPUT_NUMBER,
      col: 12,
      layout: 'vertical',
      defaultValue: 5,
    },
    {
      key: 'allowHalf',
      label: '允许半选',
      groupName: '评分',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: false,
    },
    {
      key: 'disabled',
      label: '禁用',
      groupName: '评分',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: false,
    },
  ],

  dataConfig: {},

  eventConfig: {},
}

export default config
