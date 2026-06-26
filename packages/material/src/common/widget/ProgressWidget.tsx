import { Progress } from 'antd'

import { WidgetComponentProps } from './types'

const ProgressWidget = ({ config }: WidgetComponentProps) => {
  const percent = Number(config.percent ?? 60)
  const showInfo = config.showInfo !== false
  const status = config.status as 'success' | 'exception' | 'normal' | 'active' | undefined
  const strokeColor = config.strokeColor ? String(config.strokeColor) : undefined
  const type = (config.type as 'line' | 'circle' | 'dashboard') ?? 'line'

  return (
    <Progress
      className="w-full"
      percent={percent}
      showInfo={showInfo}
      status={status}
      strokeColor={strokeColor}
      type={type}
    />
  )
}

export default ProgressWidget
