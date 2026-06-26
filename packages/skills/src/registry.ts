import { loadSkills, type LoadSkillsOptions } from './loader'
import type { SkillDefinition, SkillEntry, SkillReloadSummary } from './types'

export class SkillRegistry {
  private byName = new Map<string, SkillEntry>()

  constructor(skills: SkillDefinition[], disabled: ReadonlySet<string> = new Set()) {
    for (const skill of skills) {
      this.byName.set(skill.name, { ...skill, disabled: disabled.has(skill.name) })
    }
  }

  static async create(
    options: LoadSkillsOptions = {},
    disabled: ReadonlySet<string> = new Set(),
  ): Promise<SkillRegistry> {
    const skills = await loadSkills(options)
    return new SkillRegistry(skills, disabled)
  }

  reload(skills: SkillDefinition[], disabled: ReadonlySet<string>): SkillReloadSummary {
    const previous = this.byName
    const next = new Map<string, SkillEntry>()

    for (const skill of skills) {
      next.set(skill.name, { ...skill, disabled: disabled.has(skill.name) })
    }

    const summary: SkillReloadSummary = { added: [], removed: [], changed: [], unchanged: [] }

    for (const [name, entry] of next) {
      const prev = previous.get(name)
      if (!prev) {
        summary.added.push(name)
      } else if (
        prev.description !== entry.description ||
        prev.content !== entry.content ||
        prev.disabled !== entry.disabled
      ) {
        summary.changed.push(name)
      } else {
        summary.unchanged.push(name)
      }
    }

    for (const name of previous.keys()) {
      if (!next.has(name)) summary.removed.push(name)
    }

    this.byName = next
    return summary
  }

  get(name: string): SkillDefinition | undefined {
    const entry = this.byName.get(name)
    if (!entry || entry.disabled) return undefined
    return entry
  }

  list(): SkillDefinition[] {
    return [...this.byName.values()].filter((s) => !s.disabled)
  }

  names(): string[] {
    return this.list().map((s) => s.name)
  }

  listAll(): SkillEntry[] {
    return [...this.byName.values()]
  }

  size(): number {
    return this.byName.size
  }
}

export async function reloadSkillRegistry(
  registry: SkillRegistry,
  options: LoadSkillsOptions = {},
  disabled: ReadonlySet<string> = new Set(),
): Promise<SkillReloadSummary> {
  const skills = await loadSkills(options)
  return registry.reload(skills, disabled)
}
