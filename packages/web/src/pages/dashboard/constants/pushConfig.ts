import { PushConfigState } from '@/types/dashboard'

export const DEFAULT_PUSH_CONFIG: PushConfigState = {
  pushName: '',
  receiveMembers: [],
  channels: [],
  emailName: '',
  scheduleType: 'daily',
  weeklyDays: [],
  monthlyDays: [],
  reportSize: 'pc',
  retryCount: 0,
}
