# Go Simplifier Skill

`go-simplifier` is an OpenCode skill for simplifying recently modified Go code while preserving behavior.

## Install

Add the plugin to your global or project `opencode.json`:

```json
{
    "plugin": ["go-simplifier@git+https://github.com/prvious/ai.git"]
}
```

The plugin registers this repo's `skills/` directory, so OpenCode can discover `skills/go-simplifier/SKILL.md`.

Restart OpenCode after editing config.

## Copy Into A Project

To vendor the skill into one project, copy `skills/go-simplifier/` to:

```txt
.opencode/skills/go-simplifier/
```

Restart OpenCode after copying the skill.
