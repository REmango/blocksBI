import SvgIcon from '../SvgIcon'
import { chartIconMap } from './iconMap'

interface ChartIconProps {
  name: string
  size?: number
  className?: string
}

const ChartIcon = ({ name, size = 24, className }: ChartIconProps) => {
  const svg = chartIconMap[name]
  if (!svg) return null

  return <SvgIcon svg={svg} size={size} className={className} />
}

export default ChartIcon
