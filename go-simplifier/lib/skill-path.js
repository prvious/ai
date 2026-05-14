import path from "node:path";

export const getBundledSkillsPath = (root) => path.join(root, "skills");

export const applySkillPathToConfig = (config, skillsPath) => {
  config.skills = config.skills || {};
  config.skills.paths = Array.isArray(config.skills.paths) ? config.skills.paths : [];

  if (!config.skills.paths.includes(skillsPath)) {
    config.skills.paths.push(skillsPath);
  }
};
