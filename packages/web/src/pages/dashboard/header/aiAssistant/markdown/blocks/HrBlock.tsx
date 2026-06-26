import { memo } from 'react'

import type { HrBlockData } from '../types'

interface HrBlockProps {
  block: HrBlockData
}

export const HrBlock = memo(
  function HrBlock() {
    return <hr className="ai-md-hr" />
  },
  (prev, next) => prev.block.raw === next.block.raw,
)
