import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'

const registered = new Set<string>()

function registerLanguage(name: string, module: { default?: unknown }) {
  if (registered.has(name)) return
  hljs.registerLanguage(name, module as Parameters<typeof hljs.registerLanguage>[1])
  registered.add(name)
}

registerLanguage('javascript', javascript)
registerLanguage('js', javascript)
registerLanguage('typescript', typescript)
registerLanguage('ts', typescript)
registerLanguage('json', json)
registerLanguage('python', python)
registerLanguage('py', python)
registerLanguage('sql', sql)
registerLanguage('html', xml)
registerLanguage('xml', xml)
registerLanguage('bash', bash)
registerLanguage('shell', bash)
registerLanguage('css', css)

export function highlightCode(content: string, language: string): string {
  const lang = language.trim().toLowerCase() || 'plaintext'

  if (lang !== 'plaintext' && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(content, { language: lang, ignoreIllegals: true }).value
    } catch {
      // fall through
    }
  }

  try {
    return hljs.highlightAuto(content).value
  } catch {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}
