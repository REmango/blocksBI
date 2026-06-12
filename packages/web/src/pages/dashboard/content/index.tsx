import ViewFooter from './viewFooter'
import ViewModeToggle from './ViewModeToggle'

import { CANVAS_PARENT_ID } from '../constants'

import CanvasContainer from './canvasContainer'

const Content = () => {
  return (
    <>
      <div
        className="h-[60px] bg-zinc-800 text-white flex items-center justify-center"
        style={{ background: '#282c34' }}
      >
        <ViewModeToggle />
      </div>
      <div
        className="bg-zinc-800 overflow-y-auto overflow-x-auto h-full w-full  "
        style={{ background: '#282c34' }}
        id={CANVAS_PARENT_ID}
      >
        <CanvasContainer />
      </div>
      <ViewFooter />
    </>
  )
}

export default Content
