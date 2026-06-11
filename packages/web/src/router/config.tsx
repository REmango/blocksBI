import Dashboard from '@/pages/dashboard'
import DndKit from '@/pages/dndKit'

import type { RouteObject } from 'react-router'

const routes: RouteObject[] = [
  { path: '/', element: <Dashboard /> },
  { path: '/dndKit', element: <DndKit /> },
]

export default routes
