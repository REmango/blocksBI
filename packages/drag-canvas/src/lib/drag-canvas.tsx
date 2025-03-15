export interface MyComponentProps {
  title?: string
}

const DragCanvas: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="drag-canvas">
      <h1>Welcome to DragCanvas!11</h1>
    </div>
  )
}

export default DragCanvas
