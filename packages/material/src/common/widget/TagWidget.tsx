import { Tag } from 'antd'

import { WidgetComponentProps } from './types'

const TagWidget = ({ config }: WidgetComponentProps) => {
  const text = String(config.text ?? '标签')
  const color = config.color ? String(config.color) : undefined
  const bordered = config.bordered !== false
  const closable = Boolean(config.closable)

  return (
    <Tag color={color} bordered={bordered} closable={closable}>
      {text}
    </Tag>
  )
}

export default TagWidget
