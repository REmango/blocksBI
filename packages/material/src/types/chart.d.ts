export interface IChartConfig {
  key: string
  label: string
  groupName: string
  componentName: string
  col: number
  layout: string
  defaultValue: any
  options?: { label: string; value: string | number }[]
}

export interface CardItem<T> {
  id: string
  key: string
  componentName: string
  name: string
  props: T
}

export interface ChartData {
  metricList: { key: string; alias?: string; type?: string }[]
  dimList: { key: string; type?: string }[]
  data: Record<string, any>[]
}
