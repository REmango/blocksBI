# @block-bi/ai

BlocksBI Agent Loop 内核包 — 独立于其他子包，供 Node 端 WebSocket 调用。

## 架构

```
意图解析 → 工具选择 → 参数校验 → 远程工具执行 → 结果回填 → Agent Loop 循环
```

### 复用内核（来自 CLI Agent 设计，已适配 BI）

- **Agent Loop 主循环** — 多轮对话、工具次数上限、死循环熔断
- **LLM 统一调度** — 流式输出、请求限流、System Prompt 动态注入
- **工具运行框架** — Schema 注册、Zod 强校验、白名单/权限拦截、超时重试
- **会话能力** — 布局快照、操作日志、上下文压缩、Token 截断

### 已剔除（CLI 专属）

- 本地文件读写、Shell 命令、代码检索
- 本地沙箱 / 进程隔离
- CLI 交互式终端、工作目录上下文

### BI 适配

- **远程 WS 工具执行器** — 分层 + 依赖注入，应用层绑定 WS 实现到内核
- **BI 工作上下文** — 报表元数据、画布尺寸、组件列表
- **BI 专属 System Prompt** — 禁止虚构组件 ID、批量布局前预览

## WS 远程工具调用（分层 DI）

```
┌──────────────────────────────────────────┐
│  Application Layer                        │
│  WsToolService (Socket.IO 实现)           │
│  implements IWsToolTransport              │
└─────────────────┬────────────────────────┘
                  │ inject
┌─────────────────▼────────────────────────┐
│  Adapter Layer                            │
│  BiWsToolExecutor implements              │
│  IRemoteToolExecutor                      │
└─────────────────┬────────────────────────┘
                  │ register
┌─────────────────▼────────────────────────┐
│  Kernel                                   │
│  ToolRegistry.registerExecutor('bi_ws')   │
│  biAgentLoop → processToolCalls           │
└──────────────────────────────────────────┘
```

### 应用层启动绑定

```typescript
// packages/server/src/main.ts (示例)
import { Server } from 'socket.io'
import {
  WsToolService,
  BiWsToolExecutor,
  ToolRegistry,
  PendingRequestRegistry,
  WS_TOOL_EVENTS,
} from '@block-bi/ai'

const pending = new PendingRequestRegistry()
const namespace = io.of('/bi-agent')

const wsToolService = new WsToolService(namespace, { pendingRegistry: pending })
wsToolService.bindNamespaceListeners(namespace)

const biExecutor = new BiWsToolExecutor(wsToolService)
ToolRegistry.registerExecutor('bi_ws', biExecutor)

// Agent Loop 无需再传 remoteExecutor
await biAgentLoop(message, { modelManager, dashboardContext }, callbacks)
```

### WS 事件

| 事件 | 方向 | 说明 |
|------|------|------|
| `agent:tool:execute` | Server → Frontend | 下发工具调用请求 |
| `agent:tool:ack` | Frontend → Server | 回传执行结果 |
| `agent:tool:progress` | Frontend → Server | 可选进度更新 |

### 自定义 Transport

实现 `IWsToolTransport` 接口即可替换 Socket.IO 实现，内核无感知：

```typescript
class MyWsTransport implements IWsToolTransport {
  invokeTool(request, signal) { /* ... */ }
  handleToolAck(ack) { /* ... */ }
}
ToolRegistry.registerExecutor('bi_ws', new BiWsToolExecutor(new MyWsTransport()))
```

## 工具集（仅 Schema 定义，execute 由前端实现）

| 分类 | 工具 |
|---|---|
| 元数据 | `bi_get_canvas_meta`, `bi_list_all_components`, `bi_search_component_by_name`, `bi_get_single_component_detail`, `bi_get_current_chart_data` |
| 布局 | `bi_move_components`, `bi_resize_components`, `bi_align_components`, `bi_distribute_components`, `bi_adjust_component_margin`, `bi_set_component_visible`, `bi_adjust_component_z_index`, `bi_layout_grid_arrange` |
| 分页 | `createPage`, `switchPage`, `renamePage` |

## Model 切换

多 Provider 注册表 + 运行时切换，参考 `packages/core` 的 `modelRegistry` / `resolveModelId` 设计。

```typescript
import {
  biAgentLoop,
  BiModelManager,
  switchBiAgentModel,
  PROVIDER_MODELS,
} from '@block-bi/ai'

// 自动解析：BLOCKSBI_MODEL → .blocksbi/config.json → 首个有 API Key 的 Provider
const modelManager = BiModelManager.create()

// Agent Loop 注入 modelManager（推荐）
await biAgentLoop(message, {
  modelManager,
  dashboardContext,
  remoteExecutor,
}, callbacks)

// 运行时切换 — 持久化到 .blocksbi/config.json
const result = modelManager.switchModel('deepseek')  // 支持别名
// 或
switchBiAgentModel(state, modelManager, 'anthropic:claude-sonnet-4-6', callbacks)

// 列出已配置 Provider 的模型目录（供 UI 选择器）
modelManager.listCatalog()
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `BLOCKSBI_MODEL` | 默认模型 id 或别名 |
| `BLOCKSBI_CONFIG_PATH` | 配置文件路径（默认 `.blocksbi/config.json`） |
| `DEEPSEEK_API_KEY` 等 | Provider API Key（见 `PROVIDER_DETECTION_ORDER`） |
| `OPENAI_COMPATIBLE_API_KEY` + `OPENAI_COMPATIBLE_BASE_URL` | 自定义 OpenAI 兼容端点 |

### 模型别名

`sonnet` · `opus` · `deepseek` · `qwen` · `gemini` · `kimi` 等，见 `MODEL_ALIASES`。

## 使用示例

```typescript
import {
  biAgentLoop,
  createLoopState,
  PendingRequestRegistry,
  type RemoteToolExecutor,
  type BiAgentCallbacks,
  type BiAgentOptions,
} from '@block-bi/ai'

// 1. 实现 RemoteToolExecutor（WS 层注入）
const executor: RemoteToolExecutor = {
  async execute(request, signal) {
    // emit to frontend room, wait for ACK via PendingRequestRegistry
    return { requestId: request.requestId, ok: true, result: '...' }
  },
}

// 2. 配置 callbacks（流式推送到客户端）
const callbacks: BiAgentCallbacks = {
  onTextDelta: (text) => socket.emit('agent:message:stream', { chunk: text }),
  onToolCall: (id, name, input) => { /* ... */ },
  onToolProgress: () => {},
  onToolResult: (id, result) => { /* ... */ },
  onUsageUpdate: () => {},
  onError: (err) => { /* ... */ },
}

// 3. 运行 Agent Loop
const result = await biAgentLoop(
  '把销售图表移到左上角',
  {
    modelId: 'deepseek:deepseek-v4-flash',
    model: myLanguageModel,
    dashboardContext: { /* ... */ },
    remoteExecutor: executor,
  },
  callbacks,
)
```

## 构建

```bash
npx nx build ai
```

## 依赖

- `ai` — LLM SDK（streamText / generateText）
- `zod` — 工具参数 JSON Schema 校验

不依赖项目内其他子包（`@block-bi/web`、`@block-bi/server`、`packages/core` 等）。
