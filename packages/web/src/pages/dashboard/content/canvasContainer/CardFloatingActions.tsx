import {
  DeleteOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import classNames from 'classnames'

const CARD_FLOATING_ACTIONS = [
  { key: 'delete', label: '删除', icon: DeleteOutlined },
  { key: 'to-bottom', label: '置于底层', icon: VerticalAlignBottomOutlined },
  { key: 'to-top', label: '置于顶层', icon: VerticalAlignTopOutlined },
]

interface CardFloatingActionsProps {
  visible: boolean
}

const CardFloatingActions = ({ visible }: CardFloatingActionsProps) => {
  return (
    <div
      className={classNames('card-floating-actions', { 'is-visible': visible })}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {CARD_FLOATING_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.key}
            type="button"
            className="card-floating-action-btn"
            title={action.label}
            aria-label={action.label}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}

export default CardFloatingActions
