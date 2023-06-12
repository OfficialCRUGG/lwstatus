function runServer() {
  const http = require("http");
  const os = require("os");
  const path = require("path");
  const fs = require("fs");
  const osutils = require("node-os-utils");
  const checkDiskSpace = require("check-disk-space").default;

  const configFile = path.join(os.homedir(), ".lwstatus.json");
  const configData = JSON.parse(fs.readFileSync(configFile, "utf8"));

  const config = {
    port: configData.port ?? 3123,
    refreshInterval: configData.refreshInterval ?? 30,
    hostname: configData.hostname ?? "null",
    barWidth: configData.barWidth ?? 40,
    barChar: configData.barChar ?? "|",
    showOsInfo: configData.showOsInfo ?? true,
    showUptime: configData.showUptime ?? true,
    showCpuName: configData.showCpuName ?? true,
    showTotalProcesses: configData.showTotalProcesses ?? true,
    showCpuUsage: configData.showCpuUsage ?? true,
    showMemoryUsage: configData.showMemoryUsage ?? true,
    showMemoryDetails: configData.showMemoryDetails ?? true,
    showDrive: configData.showDrive ?? true,
  };

  const index = fs
    .readFileSync(path.join(__dirname, "index.html"), "utf8")
    .replace(
      "const interval = 5;",
      `const interval = ${config.refreshInterval};`
    )
    .replace("const barWidth = 40;", `const barWidth = ${config.barWidth};`)
    .replace(`const barChar = "|";`, `const barChar = '${config.barChar}';`)
    .replace(
      `const hostname = "debug"`,
      `const hostname = "${config.hostname}"`
    );

  const server = http.createServer(async (req, res) => {
    switch (req.url) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(index);
        res.end();
        break;
      case "/api":
        const mem = await osutils.mem.info();
        const os = await osutils.os.oos();
        const platform = await osutils.os.platform();
        const uptime = await osutils.os.uptime();
        const type = await osutils.os.type();
        const arch = await osutils.os.arch();
        const totalProcesses = await osutils.proc.totalProcesses();
        const cpuModel = await osutils.cpu.model();
        const averageUsage = await osutils.cpu.usage();
        const drive = await checkDiskSpace(platform === "win32" ? "C:/" : "/");
        const package = require("./package.json");
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.write(
          JSON.stringify({
            _version: package.version,
            cpu: {
              model: config.showCpuName ? cpuModel : null,
              averageUsage: config.showCpuUsage ? averageUsage : null,
            },
            drive: {
              free: config.showDrive ? drive.free : null,
              size: config.showDrive ? drive.size : null,
            },
            mem: {
              totalMemMb: config.showMemoryDetails ? mem.totalMemMb : null,
              usedMemMb: config.showMemoryDetails ? mem.usedMemMb : null,
              freeMemMb: config.showMemoryDetails ? mem.freeMemMb : null,
              usedMemPercentage: config.showMemoryUsage
                ? mem.usedMemPercentage
                : null,
              freeMemPercentage: config.showMemoryUsage
                ? mem.freeMemPercentage
                : null,
            },
            os: {
              os: config.showOsInfo ? os : null,
              platform: config.showOsInfo ? platform : null,
              uptime: config.showUptime ? uptime : null,
              type: config.showOsInfo ? type : null,
              arch: config.showOsInfo ? arch : null,
            },
            totalProcesses: config.showTotalProcesses ? totalProcesses : null,
          })
        );
        res.end();
        break;
      default:
        res.writeHead(302, { Location: "/" });
        res.end();
        break;
    }
  });

  server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

module.exports = runServer;
