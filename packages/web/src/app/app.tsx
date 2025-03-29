import RouterContainer from '@/router'
import { ConfigProvider } from 'antd'

import { Router, BrowserRouter } from 'react-router'

const App = () => (
  <div className="App">
    <BrowserRouter>
      <RouterContainer />
    </BrowserRouter>
  </div>
)

export default App
