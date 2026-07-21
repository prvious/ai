# Architecture Guidelines

## Simplicity and Readability

- Write code so its main execution flow can be understood from top to bottom without unnecessary jumps between methods, classes, or files.
- Prefer simple, explicit, and unsurprising code over clever, dense, or overly compact implementations.
- Code should communicate intent, not demonstrate sophistication. Do not introduce patterns or abstractions merely to make code appear more advanced.
- Keep straightforward operations inline when extracting them would only move the code elsewhere or give it a name without improving understanding.

## Abstractions

- Create an abstraction only when it groups a cohesive, genuinely complex operation into a useful and meaningful unit.
- An abstraction should materially improve readability, reuse, testability, or isolation of change. The possibility of extraction alone is not a reason to extract.
- Avoid speculative abstractions for possible future reuse. Introduce them when the current code provides a concrete reason.
- Before extracting code, ask whether the caller becomes easier to understand without reading the extracted implementation. If not, keep the code inline.

## Post-change Simplification

- After completing each coherent code change, activate the `laravel-simplifier` skill before final formatting, verification, and committing.
- Limit simplification to code modified by the current change and preserve its existing behavior.
- If simplification changes the code, run the formatter and affected tests against the final simplified version.
