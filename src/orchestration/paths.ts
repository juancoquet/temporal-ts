import { fileURLToPath } from "node:url";

export function compiledSiblingPath(currentModuleUrl: string, moduleName: string): string {
  return fileURLToPath(new URL(`./${moduleName}.js`, currentModuleUrl));
}
