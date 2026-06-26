/** MongoDB database name */
export const DB_NAME = 'blocksbi'

/** Collection names */
export const COLLECTIONS = {
  BI_USER: 'bi_user',
  BI_DASHBOARD: 'bi_dashboard',
  BI_COMPONENT: 'bi_component',
  AGENT_SESSION: 'agent_session',
  AGENT_MESSAGE: 'agent_message',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]
