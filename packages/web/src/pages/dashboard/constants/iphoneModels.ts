export interface IphoneModel {
  id: string
  label: string
  width: number
  height: number
}

/** iPhone 主流机型逻辑视口尺寸（用于画布预览） */
export const IPHONE_MODELS: IphoneModel[] = [
  { id: 'iphone-se-3', label: 'iPhone SE (3rd)', width: 375, height: 667 },
  { id: 'iphone-13', label: 'iPhone 13', width: 390, height: 844 },
  { id: 'iphone-13-pro', label: 'iPhone 13 Pro', width: 393, height: 852 },
  { id: 'iphone-13-pro-max', label: 'iPhone 13 Pro Max', width: 428, height: 926 },
  { id: 'iphone-14', label: 'iPhone 14', width: 390, height: 844 },
  { id: 'iphone-14-pro', label: 'iPhone 14 Pro', width: 393, height: 852 },
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { id: 'iphone-15', label: 'iPhone 15', width: 393, height: 852 },
  { id: 'iphone-15-plus', label: 'iPhone 15 Plus', width: 430, height: 932 },
  { id: 'iphone-15-pro', label: 'iPhone 15 Pro', width: 393, height: 852 },
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max', width: 430, height: 932 },
  { id: 'iphone-16', label: 'iPhone 16', width: 393, height: 852 },
  { id: 'iphone-16-plus', label: 'iPhone 16 Plus', width: 430, height: 932 },
  { id: 'iphone-16-pro', label: 'iPhone 16 Pro', width: 402, height: 874 },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max', width: 440, height: 956 },
]

export const DEFAULT_IPHONE_MODEL_ID = IPHONE_MODELS[2].id

export const getIphoneModel = (id: string) =>
  IPHONE_MODELS.find((item) => item.id === id) ?? IPHONE_MODELS[0]
