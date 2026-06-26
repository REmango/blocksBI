import { ChartData } from '../types/chart'

const pieDemoData: ChartData = {
  metricList: [{ key: '营收' }],
  dimList: [{ key: '渠道', type: 'category' }],
  data: [
    { 渠道: '线上商城', 营收: 45000 },
    { 渠道: '线下门店', 营收: 32000 },
    { 渠道: '第三方平台', 营收: 28000 },
    { 渠道: '企业采购', 营收: 15000 },
    { 渠道: '其他', 营收: 5000 },
  ],
}

export default pieDemoData
