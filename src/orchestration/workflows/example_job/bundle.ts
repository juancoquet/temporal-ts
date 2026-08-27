import { writeFile } from "node:fs/promises";
import { bundleWorkflowCode } from "@temporalio/worker";
import { compiledSiblingPath } from "../../paths.ts";

const workflowsPath = compiledSiblingPath(import.meta.url, "definition");
const bundlePath = compiledSiblingPath(import.meta.url, "workflow-bundle");
const { code } = await bundleWorkflowCode({ workflowsPath });
await writeFile(bundlePath, code, "utf8");
