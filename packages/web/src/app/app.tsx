import RouterContainer from '@/router'

import { Router, BrowserRouter } from 'react-router'

const App = () => (
  <div className="App">
    <BrowserRouter>
      <RouterContainer />
    </BrowserRouter>
  </div>
)

export default App
