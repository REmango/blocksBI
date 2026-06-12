import LayoutIcon from './LayoutIcon'

interface LayoutOption {
  key: string
  label: string
  columns: number
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  { key: 'three-column', label: '三栏布局', columns: 3 },
  { key: 'four-column', label: '四栏布局', columns: 4 },
]

const LayoutContainer = () => {
  return (
    <div className="layout-container px-2 py-3">
      <div className="flex flex-col gap-2">
        {LAYOUT_OPTIONS.map((item) => (
          <div
            key={item.key}
            className="layout-item flex cursor-pointer flex-col items-start gap-2 rounded px-2 py-3 transition-colors hover:bg-slate-800/60"
          >
            <div className="text-[10px] text-orange-400">{item.label}</div>
            <div className="text-orange-400">
              <LayoutIcon columns={item.columns} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LayoutContainer
