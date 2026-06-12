import { useEffect, useState } from 'react'
import { Input } from 'antd'

interface CanvasTabLabelProps {
  name: string
  pageIndex: number
  onRename: (pageIndex: number, name: string) => void
}

const CanvasTabLabel = ({ name, pageIndex, onRename }: CanvasTabLabelProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(name)

  useEffect(() => {
    if (!isEditing) {
      setValue(name)
    }
  }, [name, isEditing])

  const finishEdit = () => {
    onRename(pageIndex, value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Input
        className="view-footer-tab-input"
        size="small"
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onBlur={finishEdit}
        onPressEnter={finishEdit}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <span
      className="view-footer-tab-label"
      onDoubleClick={(e) => {
        e.stopPropagation()
        setValue(name)
        setIsEditing(true)
      }}
    >
      {name}
    </span>
  )
}

export default CanvasTabLabel
