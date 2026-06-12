import { ReactNode } from 'react'

import CardFloatingActions from './CardFloatingActions'

interface CardContainerWrapperProps {
  children: ReactNode
}

const CardContainerWrapper = ({ children }: CardContainerWrapperProps) => {
  return (
    <div className="card-container-wrapper group relative h-full w-full overflow-visible">
      <CardFloatingActions />
      {children}
    </div>
  )
}

export default CardContainerWrapper
