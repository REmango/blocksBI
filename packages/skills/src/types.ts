/** Parsed skill definition loaded from `skills/<name>/SKILL.md`. */
export interface SkillDefinition {
  name: string
  description: string
  /** Markdown body after YAML frontmatter. */
  content: string
  /** Absolute path to the skill directory. */
  dir: string
  /** Bundled resource files relative to the skill dir (excluding SKILL.md). */
  files: string[]
}

export interface SkillEntry extends SkillDefinition {
  disabled: boolean
}

export interface SkillReloadSummary {
  added: string[]
  removed: string[]
  changed: string[]
  unchanged: string[]
}
