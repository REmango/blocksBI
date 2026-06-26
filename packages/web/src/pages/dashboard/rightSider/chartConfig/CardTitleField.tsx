import { Input, Switch } from 'antd'

import useDashboardStore from '@/store/useDashboardStore'

interface CardTitleFieldProps {
  cardId: string
}

const CardTitleField = ({ cardId }: CardTitleFieldProps) => {
  const cardName = useDashboardStore((state) => state.cardMap[cardId]?.name ?? '')
  const showCardTitle = useDashboardStore((state) => state.cardMap[cardId]?.showCardTitle ?? true)
  const setCardName = useDashboardStore((state) => state.setCardName)
  const setCardShowTitle = useDashboardStore((state) => state.setCardShowTitle)

  return (
    <div className="card-title-field flex flex-col gap-3 px-2 pb-2">
      <div className="flex flex-col gap-1">
        <div className="text-xs text-slate-400">卡片标题</div>
        <Input
          value={cardName}
          placeholder="请输入卡片标题"
          onChange={(e) => setCardName(cardId, e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-slate-400">显示卡片标题</div>
        <Switch
          className="chart-config-switch"
          checked={showCardTitle}
          onChange={(checked) => setCardShowTitle(cardId, checked)}
        />
      </div>
    </div>
  )
}

export default CardTitleField
