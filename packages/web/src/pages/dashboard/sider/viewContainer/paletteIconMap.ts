import { chartIconMap } from './chartIcons/iconMap'
import { widgetIconMap } from './widgetIcons/iconMap'

export const paletteIconMap: Record<string, string> = {
  ...chartIconMap,
  ...widgetIconMap,
}

export const hasPaletteIcon = (itemKey: string) => itemKey in paletteIconMap
