import SvgIcon from './SvgIcon'
import { paletteIconMap } from './paletteIconMap'

interface PaletteIconProps {
  name: string
  size?: number
  className?: string
}

const PaletteIcon = ({ name, size = 24, className }: PaletteIconProps) => {
  const svg = paletteIconMap[name]
  if (!svg) return null

  return <SvgIcon svg={svg} size={size} className={className} />
}

export default PaletteIcon
