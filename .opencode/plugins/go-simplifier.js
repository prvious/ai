import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  applySkillPathToConfig,
  getBundledSkillsPath,
} from "../../go-simplifier/lib/skill-path.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "../..");

export const GoSimplifierPlugin = async () => {
  return {
    config: async (config) => {
      applySkillPathToConfig(config, getBundledSkillsPath(packageRoot));
    },
  };
};

export default GoSimplifierPlugin;
