import { memo, useMemo } from 'react'

import { highlightCode } from '../highlight'
import type { CodeBlockData } from '../types'

interface CodeBlockProps {
  block: CodeBlockData
}

export const CodeBlock = memo(
  function CodeBlock({ block }: CodeBlockProps) {
    const highlighted = useMemo(
      () => highlightCode(block.content, block.language),
      [block.content, block.language],
    )

    return (
      <div className="ai-md-code-block">
        {block.language && block.language !== 'plaintext' ? (
          <div className="ai-md-code-lang">{block.language}</div>
        ) : null}
        <pre className="ai-md-pre">
          <code
            className={`hljs language-${block.language || 'plaintext'}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    )
  },
  (prev, next) =>
    prev.block.content === next.block.content &&
    prev.block.language === next.block.language &&
    prev.block.isPartial === next.block.isPartial,
)
