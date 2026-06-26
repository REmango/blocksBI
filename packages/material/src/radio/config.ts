import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.RADIO,
    name: '单选框',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '单选框',
    componentName: 'radio',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'options',
      label: '选项（逗号分隔）',
      groupName: '单选框',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '选项1,选项2,选项3',
    },
    {
      key: 'defaultValue',
      label: '默认选中',
      groupName: '单选框',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '选项1',
    },
    {
      key: 'optionType',
      label: '样式',
      groupName: '单选框',
      componentName: COMPONENT_NAME.SELECT,
      col: 24,
      layout: 'vertical',
      defaultValue: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '按钮', value: 'button' },
      ],
    },
    {
      key: 'disabled',
      label: '禁用',
      groupName: '单选框',
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
