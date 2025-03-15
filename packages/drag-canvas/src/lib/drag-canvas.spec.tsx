import { render } from '@testing-library/react'

import DragCanvas from './drag-canvas'

describe('DragCanvas', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DragCanvas />)
    expect(baseElement).toBeTruthy()
  })
})
