import { useRef } from 'react'

import ViewFooter from './viewFooter'

import { CANVAS_PARENT_ID } from '../constants'

import CanvasContainer from './canvasContainer'
const Content = () => {
  return (
    <>
      <div
        className="bg-zinc-800 overflow-y-auto overflow-x-auto h-full w-full pt-[60px] "
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
