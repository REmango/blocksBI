import { Radio } from 'antd'

import { WidgetComponentProps } from './types'

const RadioWidget = ({ config }: WidgetComponentProps) => {
  const optionsText = String(config.options ?? '选项1,选项2,选项3')
  const options = optionsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const defaultValue = String(config.defaultValue ?? options[0] ?? '')
  const disabled = Boolean(config.disabled)
  const optionType = config.optionType === 'button' ? 'button' : 'default'

  return (
    <Radio.Group defaultValue={defaultValue} disabled={disabled} optionType={optionType}>
      {options.map((option) => (
        <Radio key={option} value={option}>
          {option}
        </Radio>
      ))}
    </Radio.Group>
  )
}

export default RadioWidget
