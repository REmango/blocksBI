import { ChartData } from '../types/chart'

const funnelDemoData: ChartData = {
  metricList: [{ key: '人数' }],
  dimList: [{ key: '阶段', type: 'category' }],
  data: [
    { 阶段: '访问', 人数: 10000 },
    { 阶段: '咨询', 人数: 6500 },
    { 阶段: '意向', 人数: 4200 },
    { 阶段: '下单', 人数: 2800 },
    { 阶段: '成交', 人数: 1500 },
  ],
}

export default funnelDemoData
