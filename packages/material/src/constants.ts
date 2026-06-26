export enum CARD_KEYS {
  LINE = 'line',
  PIE = 'pie',
  BAR = 'bar',
  SCATTER = 'scatter',
  SCATTER_LINE = 'scatter-line',
  SCATTER_BAR = 'scatter-bar',
  SCATTER_PIE = 'scatter-pie',
  SCATTER_SCATTER = 'scatter-scatter',
  SCATTER_SCATTER_LINE = 'scatter-scatter-line',
  BAR_LINE_MIXED = 'bar-line-mixed',
  FUNNEL = 'funnel',
  DIVIDER = 'divider',
  INPUT = 'input',
  RADIO = 'radio',
  RATE = 'rate',
  PROGRESS = 'progress',
  TAG = 'tag',
}

export const WIDGET_COMPONENT_NAMES = [
  'divider',
  'input',
  'radio',
  'rate',
  'progress',
  'tag',
] as const

export type WidgetComponentName = (typeof WIDGET_COMPONENT_NAMES)[number]

export const isWidgetComponentName = (name?: string): name is WidgetComponentName =>
  WIDGET_COMPONENT_NAMES.includes(name as WidgetComponentName)

export enum COMPONENT_NAME {
  SWITCH = 'switch',
  INPUT = 'input',
  INPUT_NUMBER = 'input-number',
  COLOR_PICKER = 'color-picker',
  SELECT = 'select',
}
