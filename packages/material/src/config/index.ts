import groupBy from 'lodash/groupBy'

import bar from '../bar/config'
import line from '../line/config'
import pie from '../pie/config'
import scatter from '../scatter/config'
import funnel from '../funnel/config'
import barLineMixed from '../barLineMixed/config'
import divider from '../divider/config'
import input from '../input/config'
import radio from '../radio/config'
import rate from '../rate/config'
import progress from '../progress/config'
import tag from '../tag/config'

import { CARD_KEYS } from '../constants'

const siderConfig = {
  [CARD_KEYS.LINE]: line.siderConfig,
  [CARD_KEYS.BAR]: bar.siderConfig,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixed.siderConfig,
  [CARD_KEYS.PIE]: pie.siderConfig,
  [CARD_KEYS.SCATTER]: scatter.siderConfig,
  [CARD_KEYS.FUNNEL]: funnel.siderConfig,
  [CARD_KEYS.DIVIDER]: divider.siderConfig,
  [CARD_KEYS.INPUT]: input.siderConfig,
  [CARD_KEYS.RADIO]: radio.siderConfig,
  [CARD_KEYS.RATE]: rate.siderConfig,
  [CARD_KEYS.PROGRESS]: progress.siderConfig,
  [CARD_KEYS.TAG]: tag.siderConfig,
}
// 分组生成侧边栏
const leftMenuConfig = groupBy(siderConfig, 'groupName')

const configMap = {
  [CARD_KEYS.LINE]: line,
  [CARD_KEYS.BAR]: bar,
  [CARD_KEYS.BAR_LINE_MIXED]: barLineMixed,
  [CARD_KEYS.PIE]: pie,
  [CARD_KEYS.SCATTER]: scatter,
  [CARD_KEYS.FUNNEL]: funnel,
  [CARD_KEYS.DIVIDER]: divider,
  [CARD_KEYS.INPUT]: input,
  [CARD_KEYS.RADIO]: radio,
  [CARD_KEYS.RATE]: rate,
  [CARD_KEYS.PROGRESS]: progress,
  [CARD_KEYS.TAG]: tag,
}

export { siderConfig, leftMenuConfig, configMap }
