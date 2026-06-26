---
name: bi-component-search
description: 组件检索 Skill — 模糊名称解析、类型过滤、ID 确认流程
---

# 组件检索 Skill

当用户用自然语言指代组件（「销售图表」「左上角那个饼图」）时，必须先检索再操作。

## 强制流程

```
用户模糊指代 → searchComponents(query) → 确认唯一匹配 → 使用返回的 componentId
```

若 `searchComponents` 返回多个结果：

1. 列出候选（名称、类型、位置）
2. 向用户确认目标，或根据位置/类型推断最可能项并说明理由
3. 禁止在多个候选未消歧时直接执行布局工具

## 检索技巧

| 用户说法     | 建议 query        |
|-------------|-------------------|
| 销售图表    | `销售` 或 `sales` |
| 饼图        | `pie` 或 `饼`     |
| 第一个图表  | listComponents + 按 y 坐标排序 |

## 无结果处理

- 调用 `listComponents` 展示当前页全部组件
- 告知用户未找到匹配项，请提供更具体名称或选中组件

## 跨页检索

- 用户未指定页面时，先 `listPages` 再逐页 `searchComponents`
- 或 `searchComponents` 不传 pageIndex 搜索全部页面
