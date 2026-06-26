# BlocksBI

基于 Nx Monorepo 的可视化 BI 看板搭建平台。从侧栏拖入图表与布局容器，在画布上自由排版，通过右侧配置面板调整样式与数据，支持 PC / 移动端预览、服务端持久化与 AI 助手对话。

## 技术栈

**前端** React 18 · TypeScript · Vite · Nx · Ant Design · Tailwind · ECharts · Zustand · @dnd-kit · interact.js

**后端** Fastify · MongoDB / Mongoose · Socket.IO

## 子包

| 包 | 说明 |
|---|---|
| `packages/web` | 看板编辑器主应用（含 AI 助手面板） |
| `packages/server` | 后端服务（看板 CRUD、AI 会话 HTTP / WebSocket） |
| `packages/material` | 图表物料库（配置 schema、ECharts 渲染、demo 数据） |
| `packages/drag-canvas` | 可拖拽画布（移动、缩放、多选、吸附） |
| `packages/ai` | BI Agent Loop 内核（LLM 调度、远程工具、上下文管理） |
| `packages/skills` | AI Skill 文件（布局、对齐、检索等领域指导） |

路径别名：`@block-bi/*` → `packages/*/src/index.ts`

## 启动

### 前置依赖

- Node.js 18+
- pnpm 11+
- MongoDB（默认连接 `mongodb://admin:123456@localhost:27017/blocksbi?authSource=admin`）

### 环境变量

复制根目录 `.env.example` 为 `.env`，按需调整：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `3001` | 后端 HTTP / WebSocket 端口 |
| `HOST` | `localhost` | 后端监听地址 |
| `CORS_ORIGIN` | `http://localhost:4200` | 允许的前端来源 |
| `MONGODB_URL` | 见 `.env.example` | MongoDB 连接串 |

前端可选（`packages/web` 构建时注入）：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | REST API 地址 |
| `VITE_WS_URL` | `http://localhost:3001` | Socket.IO 地址 |

### 开发

```bash
pnpm install

# 终端 1：前端，默认 http://localhost:4200
pnpm start

# 终端 2：后端，默认 http://localhost:3001
pnpm start:server

# 生产构建
npx nx build web
npx nx build server
```

访问 `http://localhost:4200/:dashboardId`（UUID 格式）以启用看板服务端持久化与 AI 助手。本地测试可用固定 ID：

```
http://localhost:4200/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

## 功能概览

- **画布**：多页签、网格背景、图表拖拽与缩放、布局容器（三列 / 四列）
- **侧栏**：图表组件、布局模板、图层管理、搜索
- **配置**：图表样式 / 数据、卡片标题、高级设置（画布尺寸、移动端机型）、推送配置
- **视图**：PC / 移动端切换，移动端纵向堆叠预览
- **持久化**：通过 REST API 将看板保存至 MongoDB；无 `dashboardId` 时仅使用内存状态
- **AI 助手**：多会话管理、流式回复、跨标签页同步；HTTP 管理会话，WebSocket（`/bi-agent`）实时对话

## 目录

```
blocksBI/
├── packages/web/          # 主应用
├── packages/server/       # 后端服务
├── packages/material/     # 图表物料
├── packages/drag-canvas/  # 拖拽画布
├── packages/ai/           # Agent Loop 内核
├── packages/skills/       # AI Skill 文件
├── doc/                   # 详细文档（见 doc/代码结构解读.md）
├── .env.example           # 环境变量示例
└── package.json
```

## 路由

| 路径 | 页面 |
|---|---|
| `/` | 看板编辑器（无服务端持久化） |
| `/:dashboardId` | 看板编辑器（UUID，启用 API 持久化与 AI 助手） |
| `/dndKit` | dnd-kit 调试页 |

## API 概览

| 前缀 | 说明 |
|---|---|
| `POST /api/dashboards` | 创建看板 |
| `GET/PUT /api/dashboards/:dashboardId` | 读取 / 保存看板 |
| `GET/POST /api/bi-agent/sessions` | 列出 / 创建 AI 会话 |
| `GET /api/bi-agent/sessions/:sessionId/messages` | 获取会话消息 |
| `WS /bi-agent` | AI 对话（`agent:room:join`、`agent:message:send` 等） |
