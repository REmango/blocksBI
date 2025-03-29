import React from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'

const Search = () => {
  return (
    <div>
      <Input placeholder="搜索组件" prefix={<SearchOutlined />} />
    </div>
  )
}

export default Search
