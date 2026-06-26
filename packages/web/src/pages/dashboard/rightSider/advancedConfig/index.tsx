import { useMemo } from 'react'
import { Radio, Select, Switch } from 'antd'

import useDashboardStore from '@/store/useDashboardStore'
import {
  CacheStrategy,
  DataSortOrder,
  MaxQueryCount,
  NullValueHandling,
  QueryTimeout,
  RefreshInterval,
} from '@/types/dashboard'

import {
  CACHE_STRATEGY_OPTIONS,
  DATA_SORT_OPTIONS,
  MAX_QUERY_COUNT_OPTIONS,
  NULL_VALUE_HANDLING_OPTIONS,
  QUERY_TIMEOUT_OPTIONS,
  REFRESH_INTERVAL_OPTIONS,
} from '../../constants/advancedConfig'
import FormField from '../pushConfig/FormField'

const AdvancedConfig = () => {
  const pageList = useDashboardStore((state) => state.pageList)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const cardMap = useDashboardStore((state) => state.cardMap)
  const hiddenCardIdsByPage = useDashboardStore((state) => state.hiddenCardIdsByPage)
  const setPageHiddenCardIds = useDashboardStore((state) => state.setPageHiddenCardIds)
  const advancedConfig = useDashboardStore((state) => state.advancedConfig)
  const updateAdvancedConfig = useDashboardStore((state) => state.updateAdvancedConfig)

  const currentPage = pageList[currentPageIndex] ?? []
  const hiddenCardIds = hiddenCardIdsByPage[currentPageIndex] ?? []

  const filterOptions = useMemo(
    () =>
      currentPage.map((item) => ({
        label: cardMap[item.id]?.name ?? item.id,
        value: item.id,
      })),
    [currentPage, cardMap],
  )

  return (
    <div className="chart-container advanced-config-panel px-2 py-3">
      <div className="flex flex-col gap-4">
        <FormField label="过滤">
          <Select
            className="w-full"
            mode="multiple"
            allowClear
            placeholder={filterOptions.length ? '选择要隐藏的图表' : '当前画布暂无图表'}
            disabled={filterOptions.length === 0}
            value={hiddenCardIds}
            options={filterOptions}
            onChange={(value) => setPageHiddenCardIds(currentPageIndex, value)}
          />
        </FormField>
        {hiddenCardIds.length > 0 && (
          <div className="text-[10px] text-slate-500">已选中 {hiddenCardIds.length} 个图表，将在画布中隐藏</div>
        )}

        <FormField label="全局缓存策略">
          <Select
            className="w-full"
            value={advancedConfig.cacheStrategy}
            options={CACHE_STRATEGY_OPTIONS}
            onChange={(value) => updateAdvancedConfig({ cacheStrategy: value as CacheStrategy })}
          />
        </FormField>

        <FormField label="最大查询数量">
          <Radio.Group
            className="push-radio-group"
            value={advancedConfig.maxQueryCount}
            onChange={(e) => updateAdvancedConfig({ maxQueryCount: e.target.value as MaxQueryCount })}
          >
            {MAX_QUERY_COUNT_OPTIONS.map((item) => (
              <Radio key={item.value} value={item.value} className="text-slate-300">
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </FormField>

        <FormField label="查询超时时间阈值">
          <Radio.Group
            className="push-radio-group"
            value={advancedConfig.queryTimeout}
            onChange={(e) => updateAdvancedConfig({ queryTimeout: e.target.value as QueryTimeout })}
          >
            {QUERY_TIMEOUT_OPTIONS.map((item) => (
              <Radio key={item.value} value={item.value} className="text-slate-300">
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </FormField>

        <FormField label="数据排序">
          <Select
            className="w-full"
            value={advancedConfig.dataSortOrder}
            options={DATA_SORT_OPTIONS}
            onChange={(value) => updateAdvancedConfig({ dataSortOrder: value as DataSortOrder })}
          />
        </FormField>

        <FormField label="定时刷新">
          <Switch
            className="chart-config-switch"
            checked={advancedConfig.autoRefreshEnabled}
            onChange={(checked) => updateAdvancedConfig({ autoRefreshEnabled: checked })}
          />
        </FormField>

        {advancedConfig.autoRefreshEnabled && (
          <FormField label="定时刷新时间">
            <Radio.Group
              className="push-radio-group"
              value={advancedConfig.refreshInterval}
              onChange={(e) => updateAdvancedConfig({ refreshInterval: e.target.value as RefreshInterval })}
            >
              {REFRESH_INTERVAL_OPTIONS.map((item) => (
                <Radio key={item.value} value={item.value} className="text-slate-300">
                  {item.label}
                </Radio>
              ))}
            </Radio.Group>
          </FormField>
        )}

        <FormField label="空值、异常值处理">
          <Select
            className="w-full"
            value={advancedConfig.nullValueHandling}
            options={NULL_VALUE_HANDLING_OPTIONS}
            onChange={(value) => updateAdvancedConfig({ nullValueHandling: value as NullValueHandling })}
          />
        </FormField>
      </div>
    </div>
  )
}

export default AdvancedConfig
