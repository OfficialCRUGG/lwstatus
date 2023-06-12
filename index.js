#!/usr/bin/env node
const os = require("os");
const path = require("path");
const fs = require("fs");

const configure = require("./configure");
const runServer = require("./server");

const configFile = path.join(os.homedir(), ".lwstatus.json");

const agrv = process.argv.slice(2);

if (!fs.existsSync(configFile) || agrv.includes("--configure")) {
  configure(runServer);
} else {
  runServer();
}
