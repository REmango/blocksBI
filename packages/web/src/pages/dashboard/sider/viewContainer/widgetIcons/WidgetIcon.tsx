import SvgIcon from '../SvgIcon'
import { widgetIconMap } from './iconMap'

interface WidgetIconProps {
  name: string
  size?: number
  className?: string
}

const WidgetIcon = ({ name, size = 24, className }: WidgetIconProps) => {
  const svg = widgetIconMap[name]
  if (!svg) return null

  return <SvgIcon svg={svg} size={size} className={className} />
}

export default WidgetIcon
