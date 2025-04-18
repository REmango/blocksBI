import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'

import App from './app/app'

import './app.css'
import './rewrite.css'
import './iconfont/iconfont.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<App />)
