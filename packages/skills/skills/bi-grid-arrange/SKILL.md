---
name: bi-grid-arrange
description: 网格排布 Skill — 多组件等列、等行、响应式网格布局
---

# 网格排布 Skill

当用户要求「排成网格」「几列布局」「整齐排列」时使用 `gridLayout` 工具，并遵循本规范。

## 适用场景

- 「把这几个图表排成 3 列」
- 「等间距网格布局」
- 「第一行放 KPI，下面放图表」

## 参数建议

| 组件数 | 建议 columns | gap |
|--------|-------------|-----|
| 2–4    | 2           | 16  |
| 5–8    | 3           | 16  |
| 9–12   | 4           | 12  |

## 执行步骤

1. `searchComponents` 或 `listComponents` 获取 componentIds
2. 计算网格总宽高是否超出 canvas — 超出则减少 columns 或缩小 gap
3. 调用 `gridLayout`，传入 componentIds、columns、gapX、gapY
4. 检查是否有重叠 — 有则调整 startX/startY 或 columns

## 重叠与越界处理

- 组件超出画布右/下边界：减少 columns 或缩小组件（先 resizeComponent）
- 组件重叠：增大 gap 或改用更少 columns
- 布局完成后向用户展示最终排列说明
