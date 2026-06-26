---
name: bi-layout
description: BI 看板布局最佳实践 — 组件定位、间距、对齐与越界修正
---

# BI 看板布局 Skill

当用户要求调整报表布局、排版组件、优化视觉层次时，遵循以下规范。

## 前置步骤

1. 调用 `getDashboardMetadata` 获取画布尺寸与页面信息
2. 调用 `listComponents` 或 `searchComponents` 获取精确 componentId
3. 批量操作前调用 `saveLayoutSnapshot` 保存快照

## 布局原则

- **边距**：组件距画布边缘至少 16px
- **间距**：相邻组件水平/垂直间距建议 16–24px
- **尺寸**：图表组件最小宽度 240px、最小高度 180px
- **越界修正**：x + width ≤ canvasWidth，y + height ≤ canvasHeight；超出则自动向内收缩

## 操作流程

1. 理解用户意图（移动 / 对齐 / 等距 / 网格）
2. 确认目标组件 ID
3. 描述计划布局（3 个以上组件时必须预览）
4. 逐步执行工具，每步验证结果
5. 完成后总结变更

## 禁止事项

- 禁止虚构 componentId
- 禁止在未检索组件的情况下按名称猜测 ID
- 禁止一次性大幅改动后不向用户确认
