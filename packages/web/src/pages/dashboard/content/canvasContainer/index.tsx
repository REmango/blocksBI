import { memo } from 'react'

import useDashboardStore from '@/store/useDashboardStore'

import MobileCanvasContainer from './mobileCanvasContainer'
import PcCanvasContainer from './pcCanvasContainer'

const CanvasContainer = () => {
  const viewMode = useDashboardStore((state) => state.viewMode)

  if (viewMode === 'mobile') {
    return <MobileCanvasContainer />
  }

  return <PcCanvasContainer />
}

export default memo(CanvasContainer)
