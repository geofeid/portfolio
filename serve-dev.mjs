// Dev-server launcher usable from any cwd (launch.json runs it with node).
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);

const ng = path.join(root, "node_modules", "@angular", "cli", "bin", "ng.js");
const child = spawn(
  process.execPath,
  [ng, "serve", "--proxy-config", "proxy.conf.json", "--port", "4200", "--host", "127.0.0.1"],
  { stdio: "inherit", cwd: root }
);
child.on("exit", (code) => process.exit(code ?? 0));
