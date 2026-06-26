/** Strip fenced code regions (including an unclosed trailing fence). */
function stripFencedCode(source: string): string {
  const withoutClosed = source.replace(/```[\s\S]*?```/g, '')
  return withoutClosed.replace(/```[\s\S]*$/g, '')
}

function countMatches(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0
}

/**
 * Temporarily close half-written markdown so streaming preview does not collapse.
 * Once the user finishes typing, the normalized suffix is dropped automatically.
 */
export function normalizeStreamingMarkdown(source: string): {
  normalized: string
  isPartial: boolean
} {
  let text = source
  let isPartial = false

  const fenceCount = countMatches(text, /```/g)
  if (fenceCount % 2 === 1) {
    text += '\n```'
    isPartial = true
  }

  const outsideCode = stripFencedCode(text)

  if (/\[[^\]]*\]\([^)]*$/.test(outsideCode)) {
    text += ')'
    isPartial = true
  } else if (/\[[^\]\n]*$/.test(outsideCode)) {
    text += ']'
    isPartial = true
  }

  if (countMatches(outsideCode, /\*\*/g) % 2 === 1) {
    text += '**'
    isPartial = true
  }

  if (countMatches(outsideCode, /(?<!\\)\*(?!\*)/g) % 2 === 1) {
    text += '*'
    isPartial = true
  }

  if (countMatches(outsideCode, /(?<!\\)_(?!_)/g) % 2 === 1) {
    text += '_'
    isPartial = true
  }

  if (countMatches(outsideCode, /(?<!`)`(?!`)/g) % 2 === 1) {
    text += '`'
    isPartial = true
  }

  return { normalized: text, isPartial }
}
