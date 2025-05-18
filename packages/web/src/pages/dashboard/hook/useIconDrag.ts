import { useEffect } from 'react'
import interact from 'interactjs'

import { COMPONENT_ICON_ITEM } from '@/pages/dashboard/constants'

import useDashboardStore from '@/store/useDashboardStore'

const dropItemSelector = `.${COMPONENT_ICON_ITEM}`

function useIconDrag(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const addCard = useDashboardStore((state) => state.addCard)
  const pageList = useDashboardStore((state) => state.pageList)
  const cardMap = useDashboardStore((state) => state.cardMap)

  useEffect(() => {
    let movingNode: HTMLElement | null = null // 拖动中的节点
    let movingOriginal = { x: 0, y: 0 } // 拖动组件原始距离屏幕位置
    let movingPosition = { x: 0, y: 0 } // 拖动组件相对指针偏移位置
    let nodePositionOnCanvas = { x: 0, y: 0 } // 拖动组件在grid中的位置

    const rootNode = document.querySelector('#root') as HTMLDivElement // 根结点DOM

    // 清理拖动事件，防止重复绑定
    interact(dropItemSelector).unset()
    // 元素拖动的事件
    interact(dropItemSelector).draggable({
      inertia: true, // 支持惯性
      listeners: {
        start: (event) => {
          // 获取当前元素宽度
          const width = event.target.offsetWidth
          const height = event.target.offsetHeight
          movingNode = event.target.cloneNode(true) as HTMLElement
          movingNode.style.width = `${width}px`
          movingNode.style.height = `${height}px`

          rootNode.appendChild(movingNode) // 复制到根结点
          // 记录原始组件相对位置
          const { top, left } = event.target.getBoundingClientRect()
          movingOriginal = { x: left, y: top }
        },
        move: (event) => {
          if (!canvasRef.current) return
          const { x: mainDX, y: mainDY } = canvasRef.current.getBoundingClientRect()
          const { scrollTop } = canvasRef.current

          movingPosition.x += event.dx
          movingPosition.y += event.dy
          if (movingNode) {
            movingNode.style.position = 'fixed'
            movingNode.style.top = `${movingOriginal.y}px`
            movingNode.style.left = `${movingOriginal.x}px`
            movingNode.style.transform = `translate(${movingPosition.x}px, ${movingPosition.y}px)`
            movingNode.style.opacity = '0.8'
            // 加上边框
            movingNode.style.border = '1px dashed orange'
          }

          nodePositionOnCanvas = {
            y: movingPosition.y + movingOriginal.y + scrollTop - mainDY,
            x: movingPosition.x + movingOriginal.x - mainDX,
          }
        },
        end: () => {
          rootNode.removeChild(movingNode as HTMLElement)
          movingNode = null
          movingOriginal = { x: 0, y: 0 }
          movingPosition = { x: 0, y: 0 }
          nodePositionOnCanvas = { x: 0, y: 0 }
        },
      },
    })

    // 放在画布中

    const canvasDom = canvasRef.current as HTMLDivElement

    // 放置到画布到事件
    interact(canvasDom).dropzone({
      accept: dropItemSelector,

      // ondragenter: (event) => {
      //   console.log('dragenter', event?.dragEvent?.target)
      // },
      ondrop: (event) => {
        addCard(event?.dragEvent?.target.dataset.id, {
          x: nodePositionOnCanvas.x,
          y: nodePositionOnCanvas.y,
        })
      },
    })

    return () => {
      // 卸载
      interact(dropItemSelector).unset()
      interact(canvasDom).unset()
    }
  }, [])
}

export default useIconDrag
