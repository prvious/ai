import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import {
  PRReviewPlugin,
  parseMarkdownDefinition,
  loadBundledDefinitions,
  applyDefinitionsToConfig,
} from "../../.opencode/plugins/pr-review.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

test("parseMarkdownDefinition reads simple YAML frontmatter and body", () => {
  const definition = parseMarkdownDefinition(`---
description: Reviews code
mode: subagent
permission:
  edit: deny
  bash: ask
---
Review the changed code.
`);

  expect(definition.frontmatter).toEqual({
    description: "Reviews code",
    mode: "subagent",
    permission: {
      edit: "deny",
      bash: "ask",
    },
  });
  expect(definition.body).toBe("Review the changed code.\n");
});

test("parseMarkdownDefinition strips YAML quotes", () => {
  const definition = parseMarkdownDefinition(`---
description: "Comprehensive PR review"
agent: plan
---
Run the review.
`);

  expect(definition.frontmatter).toEqual({
    description: "Comprehensive PR review",
    agent: "plan",
  });
  expect(definition.body).toBe("Run the review.\n");
});

test("parseMarkdownDefinition parses CRLF frontmatter", () => {
  const definition = parseMarkdownDefinition(
    "---\r\ndescription: Reviews code\r\nmode: subagent\r\n---\r\nReview the changed code.\r\n",
  );

  expect(definition.frontmatter).toEqual({
    description: "Reviews code",
    mode: "subagent",
  });
  expect(definition.body).toBe("Review the changed code.\n");
});

test("dangerous frontmatter keys are ignored", () => {
  const definition = parseMarkdownDefinition(`---
description: Safe review
__proto__: polluted
constructor: polluted
prototype: polluted
permission:
  edit: deny
  __proto__: polluted
  constructor: polluted
  prototype: polluted
---
Review safely.
`);

  expect(Object.prototype.polluted).toBeUndefined();
  expect(definition.frontmatter).toEqual({
    description: "Safe review",
    permission: {
      edit: "deny",
    },
  });
  expect(Object.hasOwn(definition.frontmatter, "__proto__")).toBe(false);
  expect(Object.hasOwn(definition.frontmatter, "constructor")).toBe(false);
  expect(Object.hasOwn(definition.frontmatter, "prototype")).toBe(false);
  expect(Object.hasOwn(definition.frontmatter.permission, "__proto__")).toBe(false);
  expect(Object.hasOwn(definition.frontmatter.permission, "constructor")).toBe(false);
  expect(Object.hasOwn(definition.frontmatter.permission, "prototype")).toBe(false);
});

test("parseMarkdownDefinition parses nested permission command maps", () => {
  const definition = parseMarkdownDefinition(`---
description: Reviews code
permission:
  edit: deny
  bash:
    "*": ask
    "git status*": allow
  webfetch: allow
---
Review safely.
`);

  expect(definition.frontmatter.permission).toEqual({
    edit: "deny",
    bash: {
      "*": "ask",
      "git status*": "allow",
    },
    webfetch: "allow",
  });
});

test("applyDefinitionsToConfig injects agents and commands without deleting existing config", () => {
  const config = {
    agent: {
      existing: {
        description: "Existing agent",
        prompt: "Keep me",
      },
    },
    command: {
      existing: {
        description: "Existing command",
        template: "Keep me",
      },
    },
  };

  applyDefinitionsToConfig(config, {
    agents: {
      "code-reviewer": {
        frontmatter: {
          description: "Reviews code",
          mode: "subagent",
          permission: { edit: "deny" },
        },
        body: "Review changed files.",
      },
    },
    commands: {
      "pr-review": {
        frontmatter: {
          description: "Comprehensive PR review",
          agent: "build",
        },
        body: "Run review agents.",
      },
    },
  });

  expect(config.agent.existing.prompt).toBe("Keep me");
  expect(config.agent["code-reviewer"]).toEqual({
    description: "Reviews code",
    mode: "subagent",
    permission: { edit: "deny" },
    prompt: "Review changed files.",
  });
  expect(config.command.existing.template).toBe("Keep me");
  expect(config.command["pr-review"]).toEqual({
    description: "Comprehensive PR review",
    agent: "build",
    template: "Run review agents.",
  });
});

test("dangerous definition names and frontmatter keys are not injected", () => {
  const config = { agent: {}, command: {} };
  const agents = Object.create(null);
  const commands = Object.create(null);

  agents.__proto__ = {
    frontmatter: { description: "Polluted agent" },
    body: "Pollute agent.",
  };
  agents.constructor = {
    frontmatter: { description: "Constructor agent" },
    body: "Constructor agent.",
  };
  agents.safe = {
    frontmatter: {
      description: "Safe agent",
      __proto__: "polluted",
      constructor: "polluted",
      prototype: "polluted",
      permission: {
        edit: "deny",
        constructor: "polluted",
        prototype: "polluted",
      },
    },
    body: "Safe agent.",
  };
  commands.prototype = {
    frontmatter: { description: "Prototype command" },
    body: "Prototype command.",
  };
  commands.safe = {
    frontmatter: { description: "Safe command" },
    body: "Safe command.",
  };

  applyDefinitionsToConfig(config, { agents, commands });

  expect(Object.prototype.polluted).toBeUndefined();
  expect(Object.getPrototypeOf(config.agent)).toBe(Object.prototype);
  expect(Object.hasOwn(config.agent, "__proto__")).toBe(false);
  expect(Object.hasOwn(config.agent, "constructor")).toBe(false);
  expect(Object.hasOwn(config.agent.safe, "constructor")).toBe(false);
  expect(Object.hasOwn(config.agent.safe, "prototype")).toBe(false);
  expect(Object.hasOwn(config.agent.safe.permission, "constructor")).toBe(false);
  expect(Object.hasOwn(config.agent.safe.permission, "prototype")).toBe(false);
  expect(config.agent.safe).toEqual({
    description: "Safe agent",
    permission: { edit: "deny" },
    prompt: "Safe agent.",
  });
  expect(Object.hasOwn(config.command, "prototype")).toBe(false);
  expect(config.command.safe).toEqual({
    description: "Safe command",
    template: "Safe command.",
  });
});

test("loadBundledDefinitions reads six agents and pr-review command", () => {
  const definitions = loadBundledDefinitions(root);

  expect(Object.keys(definitions.agents).sort()).toEqual([
    "code-reviewer",
    "code-simplifier",
    "comment-analyzer",
    "pr-test-analyzer",
    "silent-failure-hunter",
    "type-design-analyzer",
  ]);
  expect(Object.keys(definitions.commands)).toEqual(["pr-review"]);
  for (const definition of Object.values(definitions.agents)) {
    expect(definition.frontmatter.mode).toBe("subagent");
    expect(Object.hasOwn(definition.frontmatter, "model")).toBe(false);
    expect(definition.frontmatter.permission.edit).toBe("deny");
    expect(definition.frontmatter.permission.task).toBe("deny");
    expect(definition.frontmatter.permission.bash["*"]).toBe("ask");
    expect(definition.frontmatter.permission.bash["git status*"]).toBe("allow");
    expect(definition.frontmatter.permission.bash["git diff*"]).toBe("allow");
    expect(definition.frontmatter.permission.bash["git log*"]).toBe("allow");
    expect(definition.frontmatter.permission.bash["git show*"]).toBe("allow");
    expect(definition.frontmatter.permission.bash["gh pr view*"]).toBe("allow");
    expect(definition.frontmatter.permission.webfetch).toBe("allow");
  }
  expect(definitions.commands["pr-review"].frontmatter.description).toBe(
    "Comprehensive PR review using specialized agents",
  );
  expect(definitions.commands["pr-review"].body).toContain("$ARGUMENTS");
});
