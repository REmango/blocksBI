import { useRef } from 'react'
import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

import ViewFooter from './viewFooter'

import { CANVAS_PARENT_ID } from '../constants'
import useIconDrag from '../hook/useIconDrag'

import { componentMap } from '@block-bi/material'

// dndKit

const ChartComponent = componentMap.chart

const Content = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  useIconDrag(canvasRef)

  return (
    <>
      <div
        className="bg-zinc-800 overflow-y-auto overflow-x-auto h-full w-full pt-[60px] "
        style={{ background: '#282c34' }}
        id={CANVAS_PARENT_ID}
      >
        <div className="mb-[80px] px-[40px] ">
          <DragCanvas
            width={1000}
            height={1400}
            canvasParentId={CANVAS_PARENT_ID}
            className="mx-auto"
            canvasRef={canvasRef}
          >
            <DraggableItem
              key="item1"
              id="item1"
              initialPosition={{ x: 0, y: 0 }}
              minWidth={100}
              minHeight={100}
              initialSize={{
                width: 300,
                height: 250,
              }}
            >
              <ChartComponent
                option={{
                  xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: [
                    {
                      data: [150, 230, 224, 218, 135, 147, 260],
                      type: 'line',
                    },
                  ],
                }}
              />
            </DraggableItem>

            <DraggableItem
              key="item2"
              id="item2"
              initialPosition={{ x: 300, y: 0 }}
              minWidth={100}
              minHeight={100}
              initialSize={{
                width: 300,
                height: 250,
              }}
            >
              <ChartComponent
                option={{
                  title: {
                    text: 'Referer of a Website',
                    subtext: 'Fake Data',
                    left: 'center',
                  },
                  tooltip: {
                    trigger: 'item',
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                  },
                  series: [
                    {
                      name: 'Access From',
                      type: 'pie',
                      radius: '50%',
                      data: [
                        { value: 1048, name: 'Search Engine' },
                        { value: 735, name: 'Direct' },
                        { value: 580, name: 'Email' },
                        { value: 484, name: 'Union Ads' },
                        { value: 300, name: 'Video Ads' },
                      ],
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 10,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                      },
                    },
                  ],
                }}
              />
            </DraggableItem>
          </DragCanvas>
        </div>
      </div>
      <ViewFooter />
    </>
  )
}

export default Content
