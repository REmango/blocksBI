import { Input } from 'antd'

import { WidgetComponentProps } from './types'

const InputWidget = ({ config }: WidgetComponentProps) => {
  const placeholder = String(config.placeholder ?? '请输入')
  const defaultValue = String(config.defaultValue ?? '')
  const disabled = Boolean(config.disabled)
  const size = (config.size as 'large' | 'middle' | 'small') ?? 'middle'

  return (
    <Input
      className="w-full"
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={disabled}
      size={size}
    />
  )
}

export default InputWidget
