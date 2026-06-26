const LAYOUT_ICON_WIDTH = 100
const LAYOUT_ICON_HEIGHT = 48

interface LayoutIconProps {
  columns: number
  className?: string
}

const LayoutIcon = ({ columns, className }: LayoutIconProps) => {
  const lineXs = Array.from({ length: columns - 1 }, (_, index) => {
    const ratio = (index + 1) / columns
    return 1 + 46 * ratio
  })

  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      width={LAYOUT_ICON_WIDTH}
      height={LAYOUT_ICON_HEIGHT}
      fill="none"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="30"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {lineXs.map((x) => (
        <line key={x} x1={x} y1="1" x2={x} y2="31" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

export default LayoutIcon
