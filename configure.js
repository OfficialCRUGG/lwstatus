function configure(callback) {
  const os = require("os");
  const path = require("path");
  const fs = require("fs");

  const configFile = path.join(os.homedir(), ".lwstatus.json");

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(
    "What port should lwstatus run on? (Default: 3123)\n > ",
    (port) => {
      readline.question(
        "How frequently should be UI refresh? (in seconds; -1 to disable; Default: 30)\n > ",
        (refreshInterval) => {
          readline.question(
            "What hostname should be used? (Default: null)\n > ",
            (hostname) => {
              fs.writeFileSync(
                configFile,
                JSON.stringify(
                  {
                    port,
                    refreshInterval,
                    hostname,
                    barWidth: 40,
                    barChar: "|",
                    showOsInfo: true,
                    showUptime: true,
                    showCpuName: true,
                    showTotalProcesses: true,
                    showCpuUsage: true,
                    showMemoryUsage: true,
                    showMemoryDetails: true,
                    showDrive: true,
                  },
                  null,
                  2
                )
              );
              console.log(
                `Configuration saved to ${configFile}. To change any of the configured settings, edit this file. This file also contains further settings about what data is exposed.`
              );
              readline.close();
              callback();
            }
          );
        }
      );
    }
  );
}

module.exports = configure;
