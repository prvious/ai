# PR Review for OpenCode

`pr-review` bundles six specialized PR review subagents and one `/pr-review` command for OpenCode.

## Install

Add the plugin to your global or project `opencode.json`:

```json
{
    "plugin": ["pr-review@git+https://github.com/prvious/ai.git"]
}
```

Restart OpenCode after editing config.

## Usage

Run a full review:

```txt
/pr-review
```

Run focused reviews:

```txt
/pr-review tests errors
/pr-review comments
/pr-review simplify
/pr-review all parallel
```

The package registers these subagents:

- `code-reviewer`
- `code-simplifier`
- `comment-analyzer`
- `pr-test-analyzer`
- `silent-failure-hunter`
- `type-design-analyzer`

## Troubleshooting

If the command or agents do not appear, restart OpenCode and check plugin logs:

```bash
opencode run --print-logs "hello" 2>&1 | grep -i pr-review
```

If OpenCode caches an older Git version, clear OpenCode's package cache or pin a newer tag in `opencode.json`.

## Attribution

Built by Prvious.
