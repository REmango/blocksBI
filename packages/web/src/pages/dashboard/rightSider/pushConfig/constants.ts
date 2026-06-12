export const PUSH_CHANNEL_OPTIONS = [
  { label: '企业微信消息', value: 'wecom' },
  { label: '钉钉消息', value: 'dingtalk' },
  { label: '邮件', value: 'email' },
] as const

export const MEMBER_OPTIONS = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' },
  { label: '孙七', value: 'sunqi' },
  { label: '周八', value: 'zhouba' },
]

export const SCHEDULE_TYPE_OPTIONS = [
  { label: '按小时', value: 'hourly' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
] as const

export const WEEK_DAY_OPTIONS = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
]

export const MONTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => ({
  label: `${index + 1}日`,
  value: index + 1,
}))

export const REPORT_SIZE_OPTIONS = [
  { label: '适配 PC', value: 'pc' },
  { label: '大屏', value: 'largeScreen' },
  { label: '手机版式', value: 'mobile' },
] as const

export const RETRY_COUNT_OPTIONS = [
  { label: '0 次', value: 0 },
  { label: '1 次', value: 1 },
  { label: '2 次', value: 2 },
  { label: '3 次', value: 3 },
]
