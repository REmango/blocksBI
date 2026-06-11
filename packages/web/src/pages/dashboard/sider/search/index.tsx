import React from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import useDashboardStore from '@/store/useDashboardStore'
const Search = () => {
  const setCardSearchName = useDashboardStore((state) => state.setCardSearchName)
  const cardSearchName = useDashboardStore((state) => state.cardSearchName)
  return (
    <div>
      <Input
        placeholder="搜索组件"
        prefix={<SearchOutlined />}
        value={cardSearchName}
        onChange={(e) => setCardSearchName(e.target.value)}
      />
    </div>
  )
}

export default Search
