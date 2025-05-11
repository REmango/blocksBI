import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const ResponsiveChart: React.FC<{ option: echarts.EChartsOption }> = ({ option }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const echartsInstance = useRef<echarts.EChartsType | null>(null)

  useEffect(() => {
    // 初始化 ECharts 实例
    if (!echartsInstance.current) {
      echartsInstance.current = echarts.init(chartRef.current)
    }

    // 设置图表的配置项
    if (echartsInstance.current) {
      echartsInstance.current.setOption(option)
    }

    // 定义一个 ResizeObserver 来监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      if (echartsInstance.current) {
        echartsInstance.current.resize()
      }
    })

    // 开始观察 chartRef.current 的尺寸变化
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current)
    }

    // 清理函数，卸载时移除观察器
    return () => {
      resizeObserver.disconnect()
      if (echartsInstance.current) {
        echartsInstance.current.dispose()
      }
    }
  }, [option])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}

export default ResponsiveChart
