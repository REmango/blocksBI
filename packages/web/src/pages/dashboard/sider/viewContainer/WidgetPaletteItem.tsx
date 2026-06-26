import classNames from 'classnames'

import { COMPONENT_ICON_ITEM } from '@/pages/dashboard/constants'

import { WidgetIcon } from './widgetIcons'

interface WidgetPaletteItemProps {
  itemKey: string
  name: string
}

const WidgetPaletteItem = ({ itemKey, name }: WidgetPaletteItemProps) => {
  return (
    <div
      className={classNames(
        COMPONENT_ICON_ITEM,
        'flex basis-1/3 cursor-pointer flex-col items-center px-1 py-2',
      )}
      data-id={itemKey}
    >
      <div className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center text-orange-400">
        <WidgetIcon name={itemKey} size={24} />
      </div>
      <div className="w-full text-center text-[10px] leading-tight text-orange-400 text-ellipsis overflow-hidden">
        {name}
      </div>
    </div>
  )
}

export default WidgetPaletteItem
