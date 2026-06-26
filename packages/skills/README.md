# @block-bi/skills

BlocksBI AI Skill 文件包 — 存放 Agent 所需的领域 Skill 定义。

## 目录结构

```
packages/skills/
├── skills/                    # Skill 内容（每个子目录一个 skill）
│   ├── bi-layout/
│   │   └── SKILL.md
│   ├── bi-grid-arrange/
│   │   └── SKILL.md
│   ├── bi-component-search/
│   │   └── SKILL.md
│   └── bi-align/
│       └── SKILL.md
└── src/                       # 加载器与注册表
    ├── loader.ts
    ├── registry.ts
    └── index.ts
```

## Skill 文件格式

每个 Skill 是一个目录，内含 `SKILL.md`：

```markdown
---
name: my-skill
description: 简短描述，供 Agent 判断何时激活
---

# Skill 正文

详细的领域指导、流程、约束…
```

## 内置 Skills

| Skill | 说明 |
|-------|------|
| `bi-layout` | 看板布局最佳实践、边距间距、越界修正 |
| `bi-grid-arrange` | 网格排布参数建议与重叠处理 |
| `bi-component-search` | 模糊名称 → componentId 检索流程 |
| `bi-align` | 对齐、分布、层级调整 |

## 使用

```typescript
import {
  SkillRegistry,
  formatSkillsForPrompt,
  formatSkillActivation,
} from '@block-bi/skills'

// 加载全部 skill
const registry = await SkillRegistry.create()

// 注入 system prompt
const skillsBlock = formatSkillsForPrompt(registry.list())

// 激活某个 skill 的内容
const skill = registry.get('bi-layout')
if (skill) {
  const activated = formatSkillActivation(skill)
}
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `BLOCKSBI_SKILLS_DIR` | 覆盖默认 skill 目录（测试或自定义部署） |

## 构建

```bash
npx nx build skills
```

构建产物包含 `skills/` 目录，运行时通过 `resolveBundledSkillsDir()` 定位。

## 新增 Skill

1. 在 `packages/skills/skills/` 下创建 `<skill-name>/SKILL.md`
2. 填写 YAML frontmatter（`name`、`description` 必填）
3. 编写 Markdown 正文
4. 重新构建：`npx nx build skills`
