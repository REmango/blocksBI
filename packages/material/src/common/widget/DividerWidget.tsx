import { Divider } from 'antd'

import { WidgetComponentProps } from './types'

const DividerWidget = ({ config }: WidgetComponentProps) => {
  const children = String(config.children ?? '标题')
  const titlePlacement =
    (config.titlePlacement as 'start' | 'center' | 'end' | 'left' | 'right') ??
    (config.orientation as 'start' | 'center' | 'end' | 'left' | 'right' | undefined) ??
    'start'
  const dashed = Boolean(config.dashed)
  const plain = Boolean(config.plain)
  const titleColor = String(config.titleColor ?? '#1677ff')
  const lineColor = String(config.lineColor ?? '#1677ff')

  return (
    <Divider
      orientation={titlePlacement}
      dashed={dashed}
      plain={plain}
      style={{ borderBlockStartColor: lineColor, borderColor: lineColor, color: titleColor }}
    >
      <span style={{ color: titleColor }}>{children}</span>
    </Divider>
  )
}

export default DividerWidget
