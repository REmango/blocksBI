import { CARD_KEYS } from '@block-bi/material'

import dividerIcon from './icons/divider.svg?raw'
import inputIcon from './icons/input.svg?raw'
import radioIcon from './icons/radio.svg?raw'
import rateIcon from './icons/rate.svg?raw'
import progressIcon from './icons/progress.svg?raw'
import tagIcon from './icons/tag.svg?raw'

export const WIDGET_GROUP_NAME = '常用组件'

export const widgetIconMap: Record<string, string> = {
  [CARD_KEYS.DIVIDER]: dividerIcon,
  [CARD_KEYS.INPUT]: inputIcon,
  [CARD_KEYS.RADIO]: radioIcon,
  [CARD_KEYS.RATE]: rateIcon,
  [CARD_KEYS.PROGRESS]: progressIcon,
  [CARD_KEYS.TAG]: tagIcon,
}

export const isWidgetPaletteItem = (groupName: string, itemKey: string) =>
  groupName === WIDGET_GROUP_NAME && itemKey in widgetIconMap
