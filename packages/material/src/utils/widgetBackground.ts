export function cloneWidgetBackgroundConfigItems<T extends { options?: { label: string; value: string | number }[] }>(
  items: T[],
): T[] {
  return items.map((item) => ({
    ...item,
    ...(item.options ? { options: item.options.map((option) => ({ ...option })) } : {}),
  }))
}

export function resolveWidgetBackgroundColor(config: Record<string, unknown>): string {
  const backgroundTransparent = config.backgroundTransparent ?? true
  if (backgroundTransparent) {
    return 'transparent'
  }
  return String(config.backgroundColor ?? '#ffffff')
}
