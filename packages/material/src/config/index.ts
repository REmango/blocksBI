import groupBy from 'lodash/groupBy'

import bar from '../bar/config'
import line from '../line/config'
import pie from '../pie/config'
import scatter from '../scatter/config'
import barLineMixed from '../barLineMixed/config'

import { CARD_KEYS } from '../constants'

const siderConfig = {
  [CARD_KEYS.LINE]: line.siderConfig,
  [CARD_KEYS.BAR]: bar.siderConfig,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixed.siderConfig,
  [CARD_KEYS.PIE]: pie.siderConfig,
  [CARD_KEYS.SCATTER]: scatter.siderConfig,
}
// 分组生成侧边栏
const leftMenuConfig = groupBy(siderConfig, 'groupName')

const configMap = {
  [CARD_KEYS.LINE]: line,
  [CARD_KEYS.BAR]: bar,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixed,
  [CARD_KEYS.PIE]: pie,
  [CARD_KEYS.SCATTER]: scatter,
}

export { siderConfig, leftMenuConfig, configMap }
