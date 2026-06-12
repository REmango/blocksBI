import { ColorPicker, Input, InputNumber, Select, Switch } from 'antd'
import { COMPONENT_NAME, IChartConfig } from '@block-bi/material'

import useDashboardStore from '@/store/useDashboardStore'

interface StyleConfigFieldProps {
  cardId: string
  configKey: string
}

const StyleConfigField = ({ cardId, configKey }: StyleConfigFieldProps) => {
  const config = useDashboardStore(
    (state) =>
      state.cardMap[cardId]?.props?.styleConfig?.find((item: IChartConfig) => item.key === configKey),
  )
  const updateCardStyleValue = useDashboardStore((state) => state.updateCardStyleValue)

  if (!config) return null

  const { key, label, componentName, defaultValue, options } = config

  const handleChange = (value: unknown) => {
    updateCardStyleValue(cardId, key, value)
  }

  const renderControl = () => {
    switch (componentName) {
      case COMPONENT_NAME.SWITCH:
        return (
          <Switch
            className="chart-config-switch"
            checked={Boolean(defaultValue)}
            onChange={(checked) => handleChange(checked)}
          />
        )
      case COMPONENT_NAME.INPUT:
        return (
          <Input value={String(defaultValue ?? '')} onChange={(e) => handleChange(e.target.value)} />
        )
      case COMPONENT_NAME.INPUT_NUMBER:
        return (
          <InputNumber
            className="w-full"
            value={defaultValue as number | null}
            onChange={(value) => handleChange(value)}
          />
        )
      case COMPONENT_NAME.SELECT:
        return (
          <Select
            className="w-full"
            value={defaultValue}
            options={options?.map((option) => ({ label: option.label, value: option.value }))}
            onChange={(value) => handleChange(value)}
          />
        )
      case COMPONENT_NAME.COLOR_PICKER:
        return (
          <ColorPicker
            className="chart-config-color-picker"
            value={defaultValue as string}
            showText
            onChange={(_, hex) => handleChange(hex)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-slate-400">{label}</div>
      {renderControl()}
    </div>
  )
}

export default StyleConfigField
