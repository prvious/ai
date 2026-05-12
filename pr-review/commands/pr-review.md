---
description: Comprehensive PR review using specialized agents
agent: build
---

Run a comprehensive PR review using specialized read-only review subagents.

Requested review aspects: $ARGUMENTS

Usage:

```txt
/pr-review
/pr-review tests errors
/pr-review comments
/pr-review simplify
/pr-review all parallel
```

First determine the review scope:

- Inspect `git status`, `git diff`, `git diff --staged`, and recent `git log`.
- If a pull request is available, inspect it with `gh pr view` for title, description, files, and comments.
- Identify changed files, affected behavior, likely risk areas, and relevant project instructions.
- Respect permissions. Review subagents are read-only and must not edit files.

Parse `Requested review aspects` from `$ARGUMENTS` as optional review aspects:

- Empty value: run all applicable reviews based on the changed files and risk areas.
- `tests`: include `pr-test-analyzer`.
- `errors`: include `silent-failure-hunter`.
- `comments`: include `comment-analyzer`.
- `simplify`: include `code-simplifier`.
- `types`: include `type-design-analyzer`.
- `all`: include all six review subagents.
- `parallel`: invoke selected subagents in parallel when their reviews do not depend on each other; otherwise run sequentially.

Choose applicable subagents:

- Always include `code-reviewer` unless the diff only changes docs or comments.
- Include `pr-test-analyzer` for behavior, test, fixture, CI, or validation changes.
- Include `silent-failure-hunter` for error handling, catch blocks, fallbacks, retries, async work, parsing, IO, or external calls.
- Include `type-design-analyzer` for typed APIs, schemas, domain models, validation, config, serialization, or public interfaces.
- Include `comment-analyzer` for comment, docs, example, or contract text changes.
- Include `code-simplifier` when requested or when the diff adds notable complexity.

Invoke relevant review subagents sequentially by default. If `parallel` is requested, invoke independent selected subagents in parallel and wait for all results before summarizing.

Ask each subagent to return only high-confidence findings in its focus area, with file and line references where possible, severity, why it matters, and a minimal recommendation. Do not let subagents edit files.

Aggregate results into this final structure:

```md
## Critical Issues
Issues that should block merge or release.

## Important Issues
Issues that should be fixed before merge when practical.

## Suggestions
Lower-risk improvements or optional follow-ups.

## Strengths
Notable things the PR handles well.

## Recommended Action
One of: approve, approve with suggestions, request changes, or needs more investigation.
```

Deduplicate overlapping findings. Prefer the clearest, most specific subagent finding when multiple agents identify the same issue. If no issues are found, state that clearly and include any limits of the review.
