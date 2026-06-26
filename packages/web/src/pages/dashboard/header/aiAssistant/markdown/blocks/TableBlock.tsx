import { memo } from 'react'

import type { TableBlockData } from '../types'
import { InlineContent } from './InlineContent'

interface TableBlockProps {
  block: TableBlockData
}

export const TableBlock = memo(
  function TableBlock({ block }: TableBlockProps) {
    return (
      <div className="ai-md-table-wrap">
        <table className="ai-md-table">
          {block.header ? (
            <thead>
              <tr>
                {block.header.cells.map((cell, index) => (
                  <th
                    key={`${block.id}-head-${index}`}
                    style={{ textAlign: cell.align ?? 'left' }}
                  >
                    <InlineContent nodes={cell.inlines} />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${block.id}-row-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`${block.id}-cell-${rowIndex}-${cellIndex}`}
                    style={{ textAlign: cell.align ?? 'left' }}
                  >
                    <InlineContent nodes={cell.inlines} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  (prev, next) => prev.block.raw === next.block.raw,
)
