import { ChartData } from '../types/chart'

const lineDemoData: ChartData = {
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
}

export default lineDemoData
