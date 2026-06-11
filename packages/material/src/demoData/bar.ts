import { ChartData } from '../types/chart'

const barDemoData: ChartData = {
  metricList: [{ key: '销量' }],
  dimList: [{ key: '品类', type: 'category' }],
  data: [
    { 品类: '手机', 销量: 5200 },
    { 品类: '笔记本', 销量: 3800 },
    { 品类: '平板', 销量: 2600 },
    { 品类: '耳机', 销量: 4100 },
    { 品类: '手表', 销量: 1900 },
    { 品类: '相机', 销量: 1500 },
    { 品类: '显示器', 销量: 2200 },
    { 品类: '键盘', 销量: 2800 },
  ],
}

export default barDemoData
