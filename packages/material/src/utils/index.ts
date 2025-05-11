import { forEach, assign, get, set } from 'lodash'

import { IChartConfig } from '../types/chart'

// 更新配置
export const updateConfig = (sourceArr: IChartConfig[], targetObj?: Record<string, any>) => {
  if (targetObj) {
    forEach(sourceArr, (item) => {
      assign(item, get(targetObj, item.key, {}))
    })
  }
  return sourceArr
}

// 将配置转化为chart的options
export function getInitConfig(config: IChartConfig[]) {
  const initConfig = {}
  forEach(config, (item) => {
    set(initConfig, item.key, item.defaultValue)
  })
  return initConfig
}
