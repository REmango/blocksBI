# BlocksBI

基于 Nx Monorepo 的可视化 BI 看板搭建平台。从侧栏拖入图表与布局容器，在画布上自由排版，通过右侧配置面板调整样式与数据，支持 PC / 移动端预览与本地持久化。

## 技术栈

React 18 · TypeScript · Vite · Nx · Ant Design · Tailwind · ECharts · Zustand · @dnd-kit · interact.js

## 子包

| 包 | 说明 |
|---|---|
| `packages/web` | 看板编辑器主应用 |
| `packages/material` | 图表物料库（配置 schema、ECharts 渲染、demo 数据） |
| `packages/drag-canvas` | 可拖拽画布（移动、缩放、多选、吸附） |

路径别名：`@block-bi/*` → `packages/*/src/index.ts`

## 启动

```bash
pnpm install
pnpm start          # nx serve web，默认 http://localhost:4200
npx nx build web    # 生产构建
```

## 功能概览

- **画布**：多页签、网格背景、图表拖拽与缩放、布局容器（三列 / 四列）
- **侧栏**：图表组件、布局模板、图层管理、搜索
- **配置**：图表样式 / 数据、卡片标题、高级设置（画布尺寸、移动端机型）、推送配置
- **视图**：PC / 移动端切换，移动端纵向堆叠预览
- **持久化**：看板状态写入 `localStorage`（按页面路径），刷新后恢复

## 目录

```
blocksBI/
├── packages/web/          # 主应用
├── packages/material/     # 图表物料
├── packages/drag-canvas/  # 拖拽画布
├── doc/                   # 详细文档（见 doc/代码结构解读.md）
└── package.json
```

## 路由

| 路径 | 页面 |
|---|---|
| `/` | 看板编辑器 |
| `/dndKit` | dnd-kit 调试页 |
