---
name: bi-align
description: 对齐与分布 Skill — 左/中/右对齐、等距分布、层级调整
---

# 对齐与分布 Skill

当用户要求「左对齐」「垂直居中」「排成一行」时使用 `alignComponents` 及相关工具。

## 对齐类型映射

| 用户意图       | alignment 值 |
|---------------|--------------|
| 左对齐        | left         |
| 水平居中      | center       |
| 右对齐        | right        |
| 顶对齐        | top          |
| 垂直居中      | middle       |
| 底对齐        | bottom       |

## 操作要求

- 至少 2 个 componentId 才能对齐
- 3 个以上组件对齐前，向用户说明将以哪个组件为基准（通常选第一个或最左/最上）
- 对齐后检查是否越界，越界则微调位置

## 层级

- 「放到最前面」→ `adjustLayer` action: `bringToFront`
- 「放到最后面」→ `sendToBack`
- 「往上移一层」→ `bringForward`

## 组合场景

「左对齐并排成一行」：

1. `alignComponents` alignment: `left`（或 top，视排列方向）
2. 如需等间距，使用 `gridLayout` columns: N, gapX: 16
