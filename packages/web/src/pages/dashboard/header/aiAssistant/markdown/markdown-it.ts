import MarkdownIt from 'markdown-it'

let markdownItInstance: MarkdownIt | null = null

export function getMarkdownIt(): MarkdownIt {
  if (!markdownItInstance) {
    markdownItInstance = new MarkdownIt({
      html: false,
      linkify: true,
      breaks: true,
    })
  }
  return markdownItInstance
}
