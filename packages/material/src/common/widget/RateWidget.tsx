import { Rate } from 'antd'

import { WidgetComponentProps } from './types'

const RateWidget = ({ config }: WidgetComponentProps) => {
  const defaultValue = Number(config.defaultValue ?? 3)
  const count = Number(config.count ?? 5)
  const allowHalf = Boolean(config.allowHalf)
  const disabled = Boolean(config.disabled)

  return (
    <Rate
      defaultValue={defaultValue}
      count={count}
      allowHalf={allowHalf}
      disabled={disabled}
    />
  )
}

export default RateWidget
