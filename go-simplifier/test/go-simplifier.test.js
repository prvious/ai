import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import * as pluginModule from "../../.opencode/plugins/go-simplifier.js";
import { selectPluginForPackageName } from "../../.opencode/plugins/index.js";
import {
  applySkillPathToConfig,
  getBundledSkillsPath,
} from "../lib/skill-path.js";
import { GoSimplifierPlugin } from "../../.opencode/plugins/go-simplifier.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

test("plugin module only exports OpenCode plugin entrypoints", () => {
  expect(Object.keys(pluginModule).sort()).toEqual(["GoSimplifierPlugin", "default"]);
});

test("package entrypoint selects go-simplifier when installed with that package name", () => {
  expect(selectPluginForPackageName("go-simplifier")).toBe(GoSimplifierPlugin);
});

test("bundled go-simplifier skill exists with required frontmatter", () => {
  const skillPath = path.join(root, "skills", "go-simplifier", "SKILL.md");
  const source = fs.readFileSync(skillPath, "utf8");

  expect(source).toContain("name: go-simplifier");
  expect(source).toContain(
    "description: Use when simplifying recently modified Go/Golang code",
  );
});

test("applySkillPathToConfig adds bundled skills path without removing existing skill config", () => {
  const config = {
    skills: {
      paths: ["/existing/skills"],
      urls: ["https://example.com/.well-known/skills/"],
    },
  };
  const bundledSkillsPath = getBundledSkillsPath(root);

  applySkillPathToConfig(config, bundledSkillsPath);

  expect(config.skills).toEqual({
    paths: ["/existing/skills", bundledSkillsPath],
    urls: ["https://example.com/.well-known/skills/"],
  });
});

test("applySkillPathToConfig does not duplicate bundled skills path", () => {
  const bundledSkillsPath = getBundledSkillsPath(root);
  const config = {
    skills: {
      paths: [bundledSkillsPath],
    },
  };

  applySkillPathToConfig(config, bundledSkillsPath);

  expect(config.skills.paths).toEqual([bundledSkillsPath]);
});

test("GoSimplifierPlugin registers the bundled skills directory", async () => {
  const config = {};
  const plugin = await GoSimplifierPlugin();

  await plugin.config(config);

  expect(config.skills.paths).toEqual([getBundledSkillsPath(root)]);
});
