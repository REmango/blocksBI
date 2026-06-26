import Dashboard from '@/pages/dashboard'
import DashboardList from '@/pages/dashboardList'
import DndKit from '@/pages/dndKit'

import type { RouteObject } from 'react-router'

const routes: RouteObject[] = [
  { path: '/dashboard/list', element: <DashboardList /> },
  { path: '/', element: <Dashboard /> },
  { path: '/:dashboardId', element: <Dashboard /> },
  { path: '/dndKit', element: <DndKit /> },
]

export default routes
