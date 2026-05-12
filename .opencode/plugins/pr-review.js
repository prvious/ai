import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "../..");
const dangerousKeys = new Set(["__proto__", "constructor", "prototype"]);

const isSafeKey = (key) => !dangerousKeys.has(key);

const stripQuotes = (value) => value.replace(/^["']|["']$/g, "");

const parseScalar = (value) => {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  return stripQuotes(trimmed);
};

const parseFrontmatter = (source) => {
  const result = {};
  const lines = source.split("\n");
  const stack = [{ indent: -1, value: result }];
  let skipIndent = null;

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    const match = rawLine.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (!match) continue;

    const indent = match[1].length;
    if (skipIndent !== null) {
      if (indent > skipIndent) continue;
      skipIndent = null;
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const key = stripQuotes(match[2].trim());
    const value = match[3];
    if (!isSafeKey(key)) {
      skipIndent = indent;
      continue;
    }

    const parent = stack[stack.length - 1].value;

    if (value.trim() === "") {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
      continue;
    }

    parent[key] = parseScalar(value);
  }

  return result;
};

export const parseMarkdownDefinition = (source) => {
  const normalized = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: normalized };
  }

  return {
    frontmatter: parseFrontmatter(match[1]),
    body: match[2],
  };
};

const readDefinitions = (directory) => {
  if (!fs.existsSync(directory)) return {};

  const definitions = Object.create(null);
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const name = entry.name.replace(/\.md$/, "");
    if (!isSafeKey(name)) continue;
    const filePath = path.join(directory, entry.name);
    definitions[name] = parseMarkdownDefinition(fs.readFileSync(filePath, "utf8"));
  }
  return definitions;
};

const sanitizeFrontmatterValue = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const sanitized = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    if (isSafeKey(key)) sanitized[key] = sanitizeFrontmatterValue(nestedValue);
  }
  return sanitized;
};

const applyFrontmatter = (target, frontmatter) => {
  for (const [key, value] of Object.entries(frontmatter || {})) {
    if (isSafeKey(key)) target[key] = sanitizeFrontmatterValue(value);
  }
};

export const loadBundledDefinitions = (root = packageRoot) => ({
  agents: readDefinitions(path.join(root, "pr-review", "agents")),
  commands: readDefinitions(path.join(root, "pr-review", "commands")),
});

export const applyDefinitionsToConfig = (config, definitions) => {
  config.agent = config.agent || {};
  config.command = config.command || {};

  for (const [name, definition] of Object.entries(definitions.agents || {})) {
    if (!isSafeKey(name)) continue;
    config.agent[name] = {};
    applyFrontmatter(config.agent[name], definition.frontmatter);
    config.agent[name].prompt = definition.body;
  }

  for (const [name, definition] of Object.entries(definitions.commands || {})) {
    if (!isSafeKey(name)) continue;
    config.command[name] = {};
    applyFrontmatter(config.command[name], definition.frontmatter);
    config.command[name].template = definition.body;
  }
};

export const PRReviewPlugin = async ({ client } = {}) => {
  return {
    config: async (config) => {
      const definitions = loadBundledDefinitions();
      const agentCount = Object.keys(definitions.agents).length;
      const commandCount = Object.keys(definitions.commands).length;

      if (agentCount === 0 || commandCount === 0) {
        await client?.app?.log?.({
          body: {
            service: "pr-review",
            level: "warn",
            message: "No bundled agents or commands found",
            extra: { packageRoot, agentCount, commandCount },
          },
        });
      }

      applyDefinitionsToConfig(config, definitions);
    },
  };
};

export default PRReviewPlugin;
