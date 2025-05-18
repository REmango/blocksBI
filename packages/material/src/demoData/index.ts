import { CARD_KEYS } from '../constants'
import { ChartData } from '../types/chart'

const demoData: Record<string, ChartData> = {
  [CARD_KEYS.LINE]: {
    metricList: [{ key: 'DAU' }],
    dimList: [{ key: 'Date', type: 'datetime' }],
    data: [
      { Date: '2023-10-01', DAU: 150 },
      { Date: '2023-10-02', DAU: 160 },
      { Date: '2023-10-03', DAU: 170 },
      { Date: '2023-10-04', DAU: 180 },
      { Date: '2023-10-05', DAU: 175 },
      { Date: '2023-10-06', DAU: 185 },
      { Date: '2023-10-07', DAU: 190 },
      { Date: '2023-10-08', DAU: 200 },
      { Date: '2023-10-09', DAU: 210 },
      { Date: '2023-10-10', DAU: 220 },
      { Date: '2023-10-11', DAU: 230 },
      { Date: '2023-10-12', DAU: 240 },
      { Date: '2023-10-13', DAU: 250 },
      { Date: '2023-10-14', DAU: 260 },
      { Date: '2023-10-15', DAU: 270 },
    ],
  },
  [CARD_KEYS.BAR]: {
    metricList: [{ key: 'UserCount' }],
    dimList: [{ key: 'City' }],
    data: [
      { City: 'New York', UserCount: 5000 },
      { City: 'Los Angeles', UserCount: 3000 },
      { City: 'Chicago', UserCount: 2000 },
      { City: 'Houston', UserCount: 1500 },
      { City: 'Phoenix', UserCount: 1200 },
      { City: 'Philadelphia', UserCount: 1100 },
      { City: 'San Antonio', UserCount: 1000 },
      { City: 'San Diego', UserCount: 900 },
      { City: 'Dallas', UserCount: 800 },
      { City: 'San Jose', UserCount: 700 },
    ],
  },
  [CARD_KEYS.PIE]: {
    metricList: [{ key: 'PaymentAmount' }],
    dimList: [{ key: 'DeviceType' }],
    data: [
      { DeviceType: 'iOS', PaymentAmount: 50000 },
      { DeviceType: 'Android', PaymentAmount: 30000 },
      { DeviceType: 'Windows Phone', PaymentAmount: 5000 },
      { DeviceType: 'Others', PaymentAmount: 2000 },
    ],
  },
}

export default demoData
