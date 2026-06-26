import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { z } from 'zod'

import type { SkillDefinition } from './types'

const SKILL_FILENAME = 'SKILL.md'
const MAX_LISTED_FILES = 50

const SKIP_DIRS = new Set([
  'node_modules',
  '__pycache__',
  '.git',
  '.venv',
  'venv',
  'dist',
  'build',
])

const frontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
})

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null

  const yamlBlock = match[1]!
  const body = match[2]!
  const data: Record<string, unknown> = {}

  const foldedLines: string[] = []
  for (const line of yamlBlock.split(/\r?\n/)) {
    if (/^\s/.test(line) && line.trim() && foldedLines.length > 0) {
      foldedLines[foldedLines.length - 1] += ' ' + line.trim()
    } else {
      foldedLines.push(line)
    }
  }

  for (const line of foldedLines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx < 1) continue

    const key = trimmed.slice(0, colonIdx).trim()
    let value = trimmed.slice(colonIdx + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    data[key] = value
  }

  return { data, body }
}

async function listSkillFiles(skillDir: string): Promise<string[]> {
  const out: string[] = []

  async function walk(currentDir: string): Promise<void> {
    if (out.length >= MAX_LISTED_FILES) return

    let entries: import('node:fs').Dirent[]
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (out.length >= MAX_LISTED_FILES) return
      if (entry.name.startsWith('.')) continue
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        await walk(path.join(currentDir, entry.name))
        continue
      }
      if (!entry.isFile()) continue
      const fullPath = path.join(currentDir, entry.name)
      const rel = path.relative(skillDir, fullPath).split(path.sep).join('/')
      if (rel === SKILL_FILENAME) continue
      out.push(rel)
    }
  }

  await walk(skillDir)
  return out.sort()
}

async function loadSkillsFromDir(dir: string): Promise<SkillDefinition[]> {
  const skills: SkillDefinition[] = []

  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return skills
  }

  for (const entry of entries) {
    const skillDir = path.join(dir, entry)
    const skillFile = path.join(skillDir, SKILL_FILENAME)

    try {
      await fs.access(skillFile)
    } catch {
      continue
    }

    try {
      const raw = await fs.readFile(skillFile, 'utf-8')
      const parsed = parseFrontmatter(raw)
      if (!parsed) {
        console.warn(`[skills] Skipping ${skillFile}: no valid YAML frontmatter`)
        continue
      }

      const result = frontmatterSchema.safeParse(parsed.data)
      if (!result.success) {
        console.warn(
          `[skills] Skipping ${skillFile}: ${result.error.issues.map((i) => i.message).join(', ')}`,
        )
        continue
      }

      const files = await listSkillFiles(skillDir)
      skills.push({
        name: result.data.name,
        description: result.data.description,
        content: parsed.body.trim(),
        dir: skillDir,
        files,
      })
    } catch (err) {
      console.warn(
        `[skills] Skipping ${skillFile}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  return skills
}

/** Resolve the bundled skills directory shipped with this package. */
export function resolveBundledSkillsDir(): string {
  return path.join(__dirname, '..', 'skills')
}

export interface LoadSkillsOptions {
  /** Extra directories to scan. Later entries override earlier on name collision. */
  extraDirs?: string[]
}

/**
 * Load skills from the bundled `packages/skills/skills/` directory.
 * Override with env `BLOCKSBI_SKILLS_DIR` for testing or custom deployments.
 */
export async function loadSkills(options: LoadSkillsOptions = {}): Promise<SkillDefinition[]> {
  const override = process.env.BLOCKSBI_SKILLS_DIR
  const dirs = override ? [override] : [resolveBundledSkillsDir()]

  if (options.extraDirs) {
    dirs.push(...options.extraDirs)
  }

  const byName = new Map<string, SkillDefinition>()
  for (const dir of dirs) {
    const loaded = await loadSkillsFromDir(dir)
    for (const skill of loaded) {
      byName.set(skill.name, skill)
    }
  }

  return [...byName.values()]
}

/** Format skills for injection into a system prompt. */
export function formatSkillsForPrompt(skills: SkillDefinition[]): string {
  if (skills.length === 0) return ''

  const lines = skills.map(
    (s) => `- **${s.name}**: ${s.description}`,
  )

  return `## Available Skills

The following skills provide specialized guidance. Follow a skill's instructions when the user's task matches its description.

${lines.join('\n')}`
}

/** Format a single skill's full content for activation. */
export function formatSkillActivation(skill: SkillDefinition): string {
  const filesBlock =
    skill.files.length > 0
      ? `\n\n### Bundled files\n${skill.files.map((f) => `- ${f}`).join('\n')}`
      : ''

  return `<activated_skill name="${skill.name}">
${skill.content}${filesBlock}
</activated_skill>`
}
