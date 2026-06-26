import { AdvancedConfigState } from '@/types/dashboard'

export const CACHE_STRATEGY_OPTIONS = [
  { label: '10分钟', value: '10m' },
  { label: '半小时', value: '30m' },
  { label: '1小时', value: '1h' },
  { label: '12小时', value: '12h' },
]

export const MAX_QUERY_COUNT_OPTIONS = [
  { label: '5000', value: 5000 },
  { label: '10000', value: 10000 },
  { label: '100000', value: 100000 },
]

export const QUERY_TIMEOUT_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
]

export const DATA_SORT_OPTIONS = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]

export const REFRESH_INTERVAL_OPTIONS = [
  { label: '1分钟', value: '1m' },
  { label: '3分钟', value: '3m' },
  { label: '10分钟', value: '10m' },
]

export const NULL_VALUE_HANDLING_OPTIONS = [
  { label: '空值置 0', value: 'zero' },
  { label: '隐藏', value: 'hide' },
  { label: '显示横杠', value: 'dash' },
]

export const DEFAULT_ADVANCED_CONFIG: AdvancedConfigState = {
  cacheStrategy: '10m',
  maxQueryCount: 5000,
  queryTimeout: 10,
  dataSortOrder: 'asc',
  autoRefreshEnabled: false,
  refreshInterval: '1m',
  nullValueHandling: 'zero',
}
