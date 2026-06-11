import { HolderOutlined } from '@ant-design/icons'
import classNames from 'classnames'

interface LayerItemProps {
  name: string
  icon?: string
  isActive: boolean
  isDragging: boolean
  isOver: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

const LayerItem = (props: LayerItemProps) => {
  const {
    name,
    icon,
    isActive,
    isDragging,
    isOver,
    onSelect,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = props

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={classNames(
        'layer-item flex items-center gap-2 rounded-md border px-2 py-2 text-xs transition-colors cursor-pointer',
        {
          'border-[#ef7541] bg-slate-700/60 text-slate-100': isActive,
          'border-transparent bg-slate-800/40 text-slate-300 hover:bg-slate-700/40': !isActive,
          'opacity-40': isDragging,
          'border-slate-500 bg-slate-700/30': isOver && !isActive,
        },
      )}
    >
      <span
        className="flex shrink-0 cursor-grab items-center text-slate-500 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <HolderOutlined />
      </span>
      {icon ? (
        <span className={classNames('iconfont text-chart shrink-0 text-sm text-orange-400', icon)} />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-slate-600" />
      )}
      <span className="truncate">{name}</span>
    </li>
  )
}

export default LayerItem
