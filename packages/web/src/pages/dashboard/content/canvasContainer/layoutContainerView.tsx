import { FC, memo } from 'react'

interface LayoutContainerViewProps {
  id: string
  columns: number
  onSelect: (id: string) => void
}

const LayoutContainerView: FC<LayoutContainerViewProps> = ({ id, columns, onSelect }) => {
  return (
    <div
      className="layout-container-view box-border h-full w-full overflow-hidden"
      style={{
        border: '2px solid #2563eb',
        borderRadius: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }}
      onMouseDown={() => onSelect(id)}
    >
      <div className="flex h-full w-full">
        {Array.from({ length: columns }, (_, index) => (
          <div
            key={index}
            className="h-full min-w-0 flex-1"
            style={{
              borderRight: index < columns - 1 ? '1px dashed #7dd3fc' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(LayoutContainerView)
