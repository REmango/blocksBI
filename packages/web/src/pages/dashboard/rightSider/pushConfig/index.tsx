import { Checkbox, Input, Radio, Select } from 'antd'

import useDashboardStore from '@/store/useDashboardStore'
import { PushChannel, PushReportSize, PushScheduleType } from '@/types/dashboard'

import {
  MEMBER_OPTIONS,
  MONTH_DAY_OPTIONS,
  PUSH_CHANNEL_OPTIONS,
  REPORT_SIZE_OPTIONS,
  RETRY_COUNT_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  WEEK_DAY_OPTIONS,
} from './constants'
import FormField from './FormField'

const PushConfig = () => {
  const pushConfig = useDashboardStore((state) => state.pushConfig)
  const updatePushConfig = useDashboardStore((state) => state.updatePushConfig)

  const showEmailField = pushConfig.channels.includes('email')

  return (
    <div className="chart-container push-config-panel px-2 py-3">
      <div className="flex flex-col gap-4">
        <FormField label="推送名称">
          <Input
            value={pushConfig.pushName}
            placeholder="自定义命名"
            onChange={(e) => updatePushConfig({ pushName: e.target.value })}
          />
        </FormField>

        <FormField label="接收成员">
          <Select
            className="w-full"
            mode="multiple"
            showSearch
            placeholder="搜索并选择成员"
            optionFilterProp="label"
            value={pushConfig.receiveMembers}
            options={MEMBER_OPTIONS}
            onChange={(value) => updatePushConfig({ receiveMembers: value })}
          />
        </FormField>

        <FormField label="推送渠道">
          <Checkbox.Group
            className="push-checkbox-group"
            options={PUSH_CHANNEL_OPTIONS.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            value={pushConfig.channels}
            onChange={(value) => {
              const channels = value as PushChannel[]
              updatePushConfig({
                channels,
                emailName: channels.includes('email') ? pushConfig.emailName : '',
              })
            }}
          />
        </FormField>

        {showEmailField && (
          <FormField label="邮箱名称">
            <Input
              value={pushConfig.emailName}
              placeholder="请输入邮箱名称"
              onChange={(e) => updatePushConfig({ emailName: e.target.value })}
            />
          </FormField>
        )}

        <FormField label="执行周期调度">
          <Radio.Group
            className="push-radio-group"
            value={pushConfig.scheduleType}
            onChange={(e) => updatePushConfig({ scheduleType: e.target.value as PushScheduleType })}
          >
            {SCHEDULE_TYPE_OPTIONS.map((item) => (
              <Radio key={item.value} value={item.value} className="text-slate-300">
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </FormField>

        {pushConfig.scheduleType === 'weekly' && (
          <FormField label="执行星期">
            <Checkbox.Group
              className="flex flex-col gap-2"
              options={WEEK_DAY_OPTIONS}
              value={pushConfig.weeklyDays}
              onChange={(value) => updatePushConfig({ weeklyDays: value as number[] })}
            />
          </FormField>
        )}

        {pushConfig.scheduleType === 'monthly' && (
          <FormField label="指定日期">
            <Select
              className="w-full"
              mode="multiple"
              placeholder="请选择每月执行日期"
              value={pushConfig.monthlyDays}
              options={MONTH_DAY_OPTIONS}
              onChange={(value) => updatePushConfig({ monthlyDays: value })}
            />
          </FormField>
        )}

        <FormField label="报表尺寸">
          <Radio.Group
            className="push-radio-group"
            value={pushConfig.reportSize}
            onChange={(e) => updatePushConfig({ reportSize: e.target.value as PushReportSize })}
          >
            {REPORT_SIZE_OPTIONS.map((item) => (
              <Radio key={item.value} value={item.value} className="text-slate-300">
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </FormField>

        <FormField label="发送失败重试次数">
          <Select
            className="w-full"
            value={pushConfig.retryCount}
            options={RETRY_COUNT_OPTIONS}
            onChange={(value) => updatePushConfig({ retryCount: value })}
          />
        </FormField>
      </div>
    </div>
  )
}

export default PushConfig
