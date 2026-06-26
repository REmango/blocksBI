// 不引入第三方全局状态管理库，方便后期迁移

import React, { createContext, useState } from 'react'

// 创建一个 Context 对象

type Action = {
  type: string
  payload: any
}

export interface CanvasContextType {
  store: {
    canvasWidth: number
    canvasHeight: number
    selectedIds: string[]
    isGroupSelected: boolean
  }
  dispatch: React.Dispatch<Action>
}

const CanvasContext = createContext<CanvasContextType>({
  store: {
    canvasWidth: 1000,
    canvasHeight: 800,
    selectedIds: [],
    isGroupSelected: false,
  },
  dispatch: () => {},
})

export enum CanvasActionType {
  SET_CANVAS_WIDTH = 'setCanvasWidth',
  SET_CANVAS_HEIGHT = 'setCanvasHeight',
  SET_SELECTED_IDS = 'setSelectedIds',
  SET_IS_GROUP_SELECTED = 'setIsGroupSelected',
  MERGE_SELECTED_IDS = 'mergeSelectedIds',
}

// 创建reducer
export const canvasReducer = (state: CanvasContextType['store'], action: Action) => {
  switch (action.type) {
    case CanvasActionType.SET_CANVAS_WIDTH:
      return {
        ...state,
        canvasWidth: action.payload,
      }
    case CanvasActionType.SET_CANVAS_HEIGHT:
      return {
        ...state,
        canvasHeight: action.payload,
      }
    case CanvasActionType.SET_SELECTED_IDS:
      return {
        ...state,
        selectedIds: action.payload,
      }
    case CanvasActionType.SET_IS_GROUP_SELECTED:
      return {
        ...state,
        isGroupSelected: action.payload,
      }
    case CanvasActionType.MERGE_SELECTED_IDS:
      return {
        ...state,
        selectedIds: [...new Set([...state.selectedIds, ...action.payload])],
      }
    default:
      return state
  }
}

export default CanvasContext
