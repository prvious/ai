import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoSimplifierPlugin } from "./go-simplifier.js";
import { PRReviewPlugin } from "./pr-review.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "../..");

export const selectPluginForPackageName = (packageName) => {
  if (packageName === "go-simplifier") return GoSimplifierPlugin;
  return PRReviewPlugin;
};

const plugin = async (input, options) => {
  const selectedPlugin = selectPluginForPackageName(path.basename(packageRoot));
  return selectedPlugin(input, options);
};

export default plugin;
