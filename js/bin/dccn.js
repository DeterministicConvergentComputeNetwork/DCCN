#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

// Import your core library
import * as DCCN from "../index.js";

const args = process.argv.slice(2);
const command = args[0];

// -------------------------
// Helpers
// -------------------------
function printHelp() {
  console.log(`
DCCN CLI - Deterministic Convergent Compute Network

Usage:
  dccn init                 Initialize DCCN runtime
  dccn run <payload>       Run deterministic computation
  dccn hash <input>       Generate content hash
  dccn version            Show version
  dccn help               Show help
`);
}

// -------------------------
// Commands
// -------------------------
switch (command) {
  case "init": {
    console.log("[DCCN] initializing runtime...");
    DCCN.init?.({});
    break;
  }

  case "run": {
    const payload = args.slice(1).join(" ");

    if (!payload) {
      console.error("Missing payload. Usage: dccn run <payload>");
      process.exit(1);
    }

    const result = DCCN.run?.({ payload });

    console.log("[DCCN RESULT]");
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case "hash": {
    const input = args.slice(1).join(" ");

    if (!input) {
      console.error("Missing input. Usage: dccn hash <input>");
      process.exit(1);
    }

    if (!DCCN.hash) {
      console.error("hash() not implemented in core yet");
      process.exit(1);
    }

    const hash = DCCN.hash(input);
    console.log(hash);
    break;
  }

  case "version": {
    const pkg = JSON.parse(
      readFileSync(path.resolve(new URL("../package.json", import.meta.url)), "utf-8")
    );
    console.log(pkg.version);
    break;
  }

  case "help":
  default:
    printHelp();
    break;
}