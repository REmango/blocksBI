import ViewFooter from './viewFooter'
import ViewModeToggle from './ViewModeToggle'

import { CANVAS_PARENT_ID } from '../constants'

import CanvasContainer from './canvasContainer'

const VIEW_FOOTER_HEIGHT = 36

const Content = () => {
  return (
    <div className="relative flex h-full min-h-0 flex-col" style={{ width: '100%' }}>
      <div
        className="flex h-[60px] shrink-0 items-center justify-center text-white"
        style={{ background: '#282c34' }}
      >
        <ViewModeToggle />
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-auto w-full"
        style={{ background: '#282c34', paddingBottom: VIEW_FOOTER_HEIGHT }}
        id={CANVAS_PARENT_ID}
      >
        <div>
          <CanvasContainer />
        </div>
      </div>
      <ViewFooter />
    </div>
  )
}

export default Content
