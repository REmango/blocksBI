import { Drawer } from 'antd'

import AiAssistantPanel from './aiAssistant'

interface AiAssistantDrawerProps {
  open: boolean
  onClose: () => void
}

const AiAssistantDrawer = ({ open, onClose }: AiAssistantDrawerProps) => {
  return (
    <Drawer
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      closable={false}
      title={null}
      mask={false}
      rootClassName="dashboard-ai-assistant-drawer"
      styles={{
        header: { display: 'none' },
        body: { padding: 0, overflow: 'hidden' },
      }}
    >
      <AiAssistantPanel active={open} onClose={onClose} />
    </Drawer>
  )
}

export default AiAssistantDrawer
