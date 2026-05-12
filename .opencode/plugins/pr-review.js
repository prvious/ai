import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyDefinitionsToConfig,
  loadBundledDefinitions,
} from "../../pr-review/lib/definitions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "../..");

export const PRReviewPlugin = async ({ client } = {}) => {
  return {
    config: async (config) => {
      const definitions = loadBundledDefinitions(packageRoot);
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
