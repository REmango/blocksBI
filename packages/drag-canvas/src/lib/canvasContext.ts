import React, { createContext, useState } from 'react'

// 创建一个 Context 对象

export interface CanvasContextType {
  store: {
    canvasWidth: number
    canvasHeight: number
    selectedIds: string[]
  }
  setStore: (store: any) => void
}

const CanvasContext = createContext<CanvasContextType>({
  store: {
    canvasWidth: 1000,
    canvasHeight: 800,
    selectedIds: [],
  },
  setStore: () => {},
})

export default CanvasContext
