import { forEach, merge, set } from 'lodash'

import barSeriesItems from '../common/config/axis/series/bar'
import lineSeriesItems from '../common/config/axis/series/line'
import { CARD_KEYS } from '../constants'
import { ChartData, IChartConfig } from '../types/chart'

const toStyleOption = (styleConfig?: IChartConfig[] | Record<string, unknown>): ChartOption => {
  if (!Array.isArray(styleConfig)) return {}

  const initConfig: ChartOption = {}
  forEach(styleConfig, (item) => {
    set(initConfig, item.key, item.defaultValue)
  })
  return initConfig
}

const toSeriesStyle = (items: IChartConfig[]): SeriesOption => {
  const seriesStyle = { ...((toStyleOption(items).series as SeriesOption) ?? {}) }
  if (seriesStyle.roseType === '') {
    delete seriesStyle.roseType
  }
  return seriesStyle
}

type AxisOption = Record<string, unknown>
type SeriesOption = Record<string, unknown>
type ChartOption = Record<string, unknown>

const mergeAxis = (
  styleAxis: AxisOption | AxisOption[] | undefined,
  dataAxis: AxisOption | AxisOption[] | undefined,
): AxisOption | AxisOption[] | undefined => {
  if (dataAxis === undefined) return styleAxis
  if (Array.isArray(dataAxis)) {
    return dataAxis.map((axis, index) => {
      const styleItem = Array.isArray(styleAxis) ? styleAxis[index] : styleAxis
      return merge({}, styleItem ?? {}, axis)
    })
  }
  return merge({}, (Array.isArray(styleAxis) ? styleAxis[0] : styleAxis) ?? {}, dataAxis)
}

const buildCartesianDataOption = (
  seriesType: 'line' | 'bar',
  dataConfig: ChartData,
): ChartOption => {
  const { metricList, dimList, data } = dataConfig
  const dimKey = dimList[0]?.key
  const metricKey = metricList[0]?.key

  if (!dimKey || !metricKey || !data.length) return {}

  return {
    xAxis: { type: 'category', data: data.map((row) => row[dimKey]) },
    yAxis: { type: 'value' },
    series: [
      {
        type: seriesType,
        name: metricKey,
        data: data.map((row) => row[metricKey]),
      },
    ],
  }
}

const buildDataOption = (cardKey: string, dataConfig?: ChartData): ChartOption => {
  if (!dataConfig?.data?.length || !dataConfig.metricList?.length) return {}

  const { metricList, dimList, data } = dataConfig
  const dimKey = dimList[0]?.key

  switch (cardKey) {
    case CARD_KEYS.PIE: {
      const metricKey = metricList[0].key
      return {
        series: [
          {
            type: 'pie',
            name: metricKey,
            data: data.map((row) => ({
              name: dimKey ? row[dimKey] : metricKey,
              value: row[metricKey],
            })),
          },
        ],
      }
    }
    case CARD_KEYS.FUNNEL: {
      const metricKey = metricList[0].key
      return {
        series: [
          {
            type: 'funnel',
            name: metricKey,
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            data: data.map((row) => ({
              name: dimKey ? row[dimKey] : metricKey,
              value: row[metricKey],
            })),
          },
        ],
      }
    }
    case CARD_KEYS.SCATTER: {
      const [xMetric, yMetric] = metricList
      if (!xMetric || !yMetric) return {}

      return {
        xAxis: { type: 'value' },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'scatter',
            name: dimKey ? `${xMetric.key}/${yMetric.key}` : xMetric.key,
            data: data.map((row) => [row[xMetric.key], row[yMetric.key]]),
          },
        ],
      }
    }
    case CARD_KEYS.BAR_LINE_MIXED: {
      const [barMetric, lineMetric] = metricList
      if (!dimKey || !barMetric || !lineMetric) return {}

      return {
        xAxis: { type: 'category', data: data.map((row) => row[dimKey]) },
        yAxis: [
          { type: 'value', name: barMetric.key },
          { type: 'value', name: lineMetric.key },
        ],
        series: [
          {
            type: 'bar',
            name: barMetric.key,
            yAxisIndex: 0,
            data: data.map((row) => row[barMetric.key]),
          },
          {
            type: 'line',
            name: lineMetric.key,
            yAxisIndex: 1,
            data: data.map((row) => row[lineMetric.key]),
          },
        ],
      }
    }
    case CARD_KEYS.BAR:
      return buildCartesianDataOption('bar', dataConfig)
    case CARD_KEYS.LINE:
      return buildCartesianDataOption('line', dataConfig)
    default:
      return buildCartesianDataOption('line', dataConfig)
  }
}

export function buildChartOption(
  cardKey: string,
  styleConfig?: IChartConfig[],
  dataConfig?: ChartData,
): ChartOption {
  const styleOption = toStyleOption(styleConfig)
  const dataOption = buildDataOption(cardKey, dataConfig)

  const seriesStyle = { ...((styleOption.series as SeriesOption) ?? {}) }
  if (seriesStyle.roseType === '') {
    delete seriesStyle.roseType
  }
  const { series: _series, xAxis: styleXAxis, yAxis: styleYAxis, ...restStyle } = styleOption

  const option: ChartOption = { ...restStyle }

  const mergedXAxis = mergeAxis(styleXAxis as AxisOption | AxisOption[] | undefined, dataOption.xAxis as AxisOption | AxisOption[] | undefined)
  if (mergedXAxis !== undefined) {
    option.xAxis = mergedXAxis
  }

  const mergedYAxis = mergeAxis(styleYAxis as AxisOption | AxisOption[] | undefined, dataOption.yAxis as AxisOption | AxisOption[] | undefined)
  if (mergedYAxis !== undefined) {
    option.yAxis = mergedYAxis
  }

  const dataSeries = dataOption.series as SeriesOption[] | undefined
  if (dataSeries?.length) {
    if (cardKey === CARD_KEYS.BAR_LINE_MIXED && dataSeries.length >= 2) {
      const barStyle = toSeriesStyle(barSeriesItems)
      const lineStyle = toSeriesStyle(lineSeriesItems)
      option.series = [
        merge({}, barStyle, dataSeries[0]),
        merge({}, lineStyle, dataSeries[1]),
      ]
    } else {
      option.series = dataSeries.map((item, index) => {
        const style = index === 0 ? seriesStyle : merge({}, seriesStyle, { type: item.type })
        return merge({}, style, item)
      })
    }
  } else if (seriesStyle && Object.keys(seriesStyle).length) {
    option.series = seriesStyle
  }

  return option
}
