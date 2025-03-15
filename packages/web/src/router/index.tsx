import { useRoutes } from 'react-router'

import routesConfig from './config'

const RouterContainer = () => {
  const routes = useRoutes(routesConfig)
  return routes
}

export default RouterContainer
