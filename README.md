# BlocksBI

基于 Nx Monorepo 的可视化 BI 看板搭建平台。从侧栏拖入图表与常用组件，在画布上自由排版，通过右侧配置面板调整样式与数据；支持 PC / 移动端预览、MongoDB 持久化与 AI 助手对话。

## 特性

- **拖拽画布** — 图表自由移动、缩放、多选与吸附对齐（`drag-canvas`）
- **丰富物料** — 折线 / 柱状 / 饼图 / 散点 / 漏斗 / 柱线混合图，以及标题、输入框、单选框等常用组件
- **可视化配置** — 图表标题、图例、提示框、系列样式等均可面板化调整
- **多页看板** — 支持多画布页签、图层排序、布局容器（三列 / 四列）
- **双端预览** — PC 自由布局与移动端纵向堆叠预览一键切换
- **持久化** — 带 UUID 的看板通过 REST API 保存至 MongoDB
- **AI 助手** — 多会话、流式回复、跨标签页同步；Agent 可调用画布布局等远程工具

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Vite · Nx · Ant Design · Tailwind · ECharts · Zustand |
| 画布 | `@block-bi/drag-canvas` · interact.js · @dnd-kit |
| 后端 | Fastify · MongoDB / Mongoose · Socket.IO |
| AI | `@block-bi/ai` Agent Loop · `@block-bi/skills` |

## Monorepo 子包

| 包 | 说明 |
|----|------|
| [`packages/web`](packages/web) | 看板编辑器主应用（画布、侧栏、配置面板、AI 助手） |
| [`packages/server`](packages/server) | 后端服务（看板 CRUD、AI 会话 HTTP / WebSocket） |
| [`packages/material`](packages/material) | 物料库（配置 schema、ECharts / 组件渲染、demo 数据） |
| [`packages/drag-canvas`](packages/drag-canvas) | 可拖拽画布内核（移动、缩放、多选、吸附） |
| [`packages/ai`](packages/ai) | BI Agent Loop 内核（LLM 调度、远程工具、上下文管理） |
| [`packages/skills`](packages/skills) | AI Skill 文件（布局、对齐、组件检索等领域指导） |

路径别名：`@block-bi/*` → 各子包 `src/index.ts`

## 内置物料

| 分组 | 组件 |
|------|------|
| 常用图表 | 折线图、柱状图、饼图、散点图、漏斗图 |
| 混合图表 | 柱线混合图 |
| 常用组件 | 标题、输入框、单选框、评分、进度条、标签 |

图表组件使用 ECharts 渲染并包裹卡片容器；常用组件直接渲染，支持背景透明等独立样式配置。

## 快速开始

### 前置依赖

- Node.js 18+
- pnpm 11+
- Docker（推荐，用于运行 MongoDB）
- MongoDB 7+（或使用下方 Docker 一键启动）

### 1. 启动 MongoDB（Docker）

使用与 `.env.example` 一致的账号密码启动本地 MongoDB：

```bash
docker run -d \
  --name blocksbi-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=123456 \
  mongo:7
```

常用操作：

```bash
# 查看运行状态
docker ps --filter name=blocksbi-mongo

# 停止 / 启动
docker stop blocksbi-mongo
docker start blocksbi-mongo

# 删除容器（数据会丢失）
docker rm -f blocksbi-mongo
```

连接串（写入 `.env` 的 `MONGODB_URL`）：

```
mongodb://admin:123456@localhost:27017/blocksbi?authSource=admin
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

**方式一：Shell 导出（推荐开发时使用）**

在启动后端前，于当前终端执行（将 `xxxx` 替换为真实 Key）：

```bash
# MongoDB（若未写入 .env）
export MONGODB_URL="mongodb://admin:123456@localhost:27017/blocksbi?authSource=admin"

# LLM Provider（任选其一，示例 DeepSeek）
export DEEPSEEK_API_KEY="xxxx"

# 可选：显式指定默认模型
export BLOCKSBI_MODEL="deepseek:deepseek-v4-flash"
```

也支持其他 Provider：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_GENERATIVE_AI_API_KEY` 等；或使用 OpenAI 兼容端点：

```bash
export OPENAI_COMPATIBLE_API_KEY="xxxx"
export OPENAI_COMPATIBLE_BASE_URL="https://your-api-endpoint/v1"
```

**方式二：`.env` 文件**

复制根目录 `.env.example` 为 `.env`，按需修改：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3001` | 后端 HTTP / WebSocket 端口 |
| `HOST` | `localhost` | 后端监听地址 |
| `CORS_ORIGIN` | `http://localhost:4200` | 允许的前端来源 |
| `MONGODB_URL` | 见 `.env.example` | MongoDB 连接串 |
| `DEEPSEEK_API_KEY` 等 | — | LLM Provider Key，见 [`packages/ai/README.md`](packages/ai/README.md) |
| `BLOCKSBI_MODEL` | 自动检测 | 默认模型 id 或别名 |

前端可选（构建时注入）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_URL` | `http://localhost:3001` | REST API 地址 |
| `VITE_WS_URL` | `http://localhost:3001` | Socket.IO 地址 |

### 4. 启动开发服务

```bash
# 终端 1：前端 → http://localhost:4200
pnpm start

# 终端 2：后端 → http://localhost:3001
pnpm start:server
```

### 5. 访问看板

| 地址 | 说明 |
|------|------|
| `http://localhost:4200/` | 编辑器（仅内存状态，不持久化） |
| `http://localhost:4200/:dashboardId` | 编辑器（UUID，启用持久化与 AI 助手） |

本地测试示例：

```
http://localhost:4200/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

## 常用命令

```bash
# 生产构建
npx nx build web
npx nx build server

# 类型检查 / 测试（按子包）
npx nx run material:build
npx nx test web
```

## 项目结构

```
blocksBI/
├── packages/
│   ├── web/           # 看板编辑器
│   ├── server/        # Fastify 后端
│   ├── material/      # 图表 & 组件物料
│   ├── drag-canvas/   # 拖拽画布
│   ├── ai/            # Agent Loop 内核
│   └── skills/        # AI Skill 定义
├── doc/
│   └── 代码结构解读.md  # 架构与扩展指南
├── .env.example
├── LICENSE
└── package.json
```

## 路由

| 路径 | 页面 |
|------|------|
| `/` | 看板编辑器 |
| `/:dashboardId` | 看板编辑器（UUID，持久化 + AI） |
| `/dndKit` | dnd-kit 调试页 |

## API 概览

| 接口 | 说明 |
|------|------|
| `POST /api/dashboards` | 创建看板 |
| `GET /api/dashboards/:dashboardId` | 读取看板 |
| `PUT /api/dashboards/:dashboardId` | 保存看板 |
| `GET /api/bi-agent/sessions` | 列出 AI 会话 |
| `POST /api/bi-agent/sessions` | 创建 AI 会话 |
| `GET /api/bi-agent/sessions/:sessionId/messages` | 获取会话消息 |
| `WS /bi-agent` | AI 实时对话（`agent:room:join`、`agent:message:send` 等） |

## 扩展开发

- **新增图表 / 组件物料**：在 `packages/material` 中添加 `config.ts`、demo 数据，并注册至 `config/index.ts` 与 `buildChartOption.ts`。详见 [`doc/代码结构解读.md`](doc/代码结构解读.md)。
- **AI 工具与 Skill**：在 `packages/ai` 注册工具，在 `packages/skills/skills/` 添加 Skill 文件。
- **Agent 内核细节**：见 [`packages/ai/README.md`](packages/ai/README.md)。

## License

[MIT](LICENSE)
