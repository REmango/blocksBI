import { Button, InputNumber, Space } from 'antd'

import useDashboardStore from '@/store/useDashboardStore'

const CANVAS_PRESETS = [
  { label: '1000 × 1400', width: 1000, height: 1400 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1280 × 720', width: 1280, height: 720 },
]

const SettingsPanel = () => {
  const canvasWidth = useDashboardStore((state) => state.canvasWidth)
  const canvasHeight = useDashboardStore((state) => state.canvasHeight)
  const setCanvasWidth = useDashboardStore((state) => state.setCanvasWidth)
  const setCanvasHeight = useDashboardStore((state) => state.setCanvasHeight)

  const applyPreset = (width: number, height: number) => {
    setCanvasWidth(width)
    setCanvasHeight(height)
  }

  return (
    <div className="dashboard-settings-panel w-[260px]">
      <div className="mb-3 text-sm font-medium text-slate-200">画布全局配置</div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="shrink-0 text-xs text-slate-400">画布宽度</span>
        <InputNumber
          className="w-[140px]"
          min={400}
          max={5000}
          step={10}
          value={canvasWidth}
          onChange={(value) => setCanvasWidth(value ?? canvasWidth)}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="shrink-0 text-xs text-slate-400">画布高度</span>
        <InputNumber
          className="w-[140px]"
          min={400}
          max={5000}
          step={10}
          value={canvasHeight}
          onChange={(value) => setCanvasHeight(value ?? canvasHeight)}
        />
      </div>

      <div className="mb-2 text-xs text-slate-400">常用尺寸</div>
      <Space size={[8, 8]} wrap>
        {CANVAS_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="small"
            type={canvasWidth === preset.width && canvasHeight === preset.height ? 'primary' : 'default'}
            onClick={() => applyPreset(preset.width, preset.height)}
          >
            {preset.label}
          </Button>
        ))}
      </Space>
    </div>
  )
}

export default SettingsPanel
