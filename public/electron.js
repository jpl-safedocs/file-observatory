/**
 * Copyright (c) 2018-2023 California Institute of Technology ("Caltech"). U.S.
 * Government sponsorship acknowledged.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Caltech nor its operating division, the Jet Propulsion
 *   Laboratory, nor the names of its contributors may be used to endorse or
 *   promote products derived from this software without specific prior written
 *   permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  dialog,
  shell,
  Menu,
} = require("electron");
const { exec, spawn } = require("child_process");
const EventEmitter = require("events");

const electronDl = require("electron-dl");
const { download } = require("electron-dl");

const fs = require("fs");

const emitter = new EventEmitter();

const path = require("path");
const url = require("url");
const AWS = require("aws-sdk");

emitter.setMaxListeners(100);

let window;

const createWindow = () => {
  window = new BrowserWindow({
    title: "Safedocs Observatory",
    width: 1660,
    minWidth: 1660,
    height: 800,
    minHeight: 800,
    titleBarStyle: "hiddenInset",
    titleBarOverlay: true,
    maximizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  window.maximize();

  const appURL = app.isPackaged
    ? `file://${__dirname}/index.html`
    : "http://localhost:3000";
  window.loadURL(appURL);
};

const setupLocalFilesNormalizerProxy = () => {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error("Failed to register protocol");
    }
  );
};

electronDl();
app.whenReady().then(() => {
  createWindow();
  setupLocalFilesNormalizerProxy();
  app.commandLine.appendSwitch("ignore-certificate-errors");
  app.commandLine.appendSwitch("allow-insecure-localhost", "true");

  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  
    // Prevent having error
    event.preventDefault()
    // and continue
    callback(true)

})

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on("shell-new-window", (evt, url) => {
    evt.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.on("list-dir", (event, info) => {
    let normalizedPath = path.normalize(info.path);
    const exists = fs.existsSync(normalizedPath);
    if (!exists) {
      return;
    }

    let files = fs.readdirSync(normalizedPath);
    if (info.extension) {
      files = files.filter(
        (file) =>
          file && typeof file === "string" && file.endsWith(info.extension)
      );
    }
    window.webContents.send("listed-dir", {
      files: files,
      trigger: info.trigger,
    });
  });

  ipcMain.on("generate-hex-editor-file", (event, info) => {
    let normalizedPath = path.normalize(info.path);

    const fileExists =
      !info.useRawFileLocation || fs.existsSync(normalizedPath);
    if (!fileExists) {
      window.webContents.send("generated-hex-file", {
        path: info.outputFile,
        error: true,
        message: `Hex Editor file does not exist: ${normalizedPath}`,
      });
      return;
    }

    let tempDir = path.join(app.getPath("userData"), "polyfile_tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdir(tempDir, (err) => {
        if (err) {
          console.error("Error creating temp polyfile directory");
        }
      });
    }

    let dockerScript =
      app.isPackaged && process.platform === "darwin"
        ? "/usr/local/bin/docker"
        : "docker";

    let dockerPath = app.isPackaged
      ? path.join(process.resourcesPath, "docker")
      : path.join(__dirname, "..", "docker");
    let buildCommand = `${dockerScript} build -t file-observatory-app-polyfile "${path.join(
      dockerPath,
      "polyfile"
    )}"`;

    exec(buildCommand, async (err, stdout, stderr) => {
      if (err) {
        console.error(
          `Docker exited while trying to build polyfile container: ${buildCommand}`
        );
        window.webContents.send("generated-hex-file", {
          path: info.outputFile,
          error: true,
          message: `Docker exited while trying to build polyfile container: ${buildCommand} : ${err}`,
        });
        return;
      }

      let downloadedFilePath = "";

      if (info.useS3) {
        let credentials = new AWS.SharedIniFileCredentials({
          profile: info.awsProfileName,
        });
        AWS.config.update({ credentials });

        let s3 = new AWS.S3();

        let url = info.url.startsWith(info.s3BucketName + "/")
          ? info.url.replace(info.s3BucketName + "/", "")
          : info.url;

        await s3.getObject(
          {
            Bucket: info.s3BucketName,
            Key: url,
          },
          async (err, data) => {
            if (err) {
              console.error(err);
              return;
            }

            downloadedFilePath = path.join(
              tempDir,
              normalizedPath.split(path.sep)[
                normalizedPath.split(path.sep).length - 1
              ]
            );

            await fs.writeFileSync(downloadedFilePath, data.Body);
          }
        );
      } else if (!info.useRawFileLocation) {
        download(BrowserWindow.getFocusedWindow(), info.url, {
          directory: tempDir,
        });
        downloadedFilePath = path.join(
          tempDir,
          info.url.split("/")[info.url.split("/").length - 1]
        );
      } else {
        downloadedFilePath = path.join(
          tempDir,
          normalizedPath.split(path.sep)[
            normalizedPath.split(path.sep).length - 1
          ]
        );
        if (fs.existsSync(normalizedPath)) {
          fs.copyFileSync(normalizedPath, downloadedFilePath);
        }
      }

      let polyfileCommand = `${dockerScript} run -v "${tempDir}":"${tempDir}" -a stdin -a stdout file-observatory-app-polyfile --html "${downloadedFilePath}.html" "${downloadedFilePath}" > /dev/null`;
      exec(
        polyfileCommand,
        { timeout: 10 * 60 * 1000 },
        (err, stdout, stderr) => {
          if (err) {
            console.error("Polyfile Error:", err);
            window.webContents.send("generated-hex-file", {
              path: info.outputFile,
              error: true,
              message: `Polyfile exited while running: ${polyfileCommand}`,
            });
            return;
          }

          let htmlOutput = fs.readFileSync(`${downloadedFilePath}.html`, {
            encoding: "utf8",
            flag: "r",
          });
          htmlOutput = htmlOutput.replace(
            '"object"==typeof module&&"object"==typeof module.exports',
            "false"
          );
          fs.writeFileSync(`${downloadedFilePath}.html`, htmlOutput);

          fs.rename(`${downloadedFilePath}.html`, info.outputFile, (err) => {
            if (err) {
              console.error(
                `Error moving Polyfile output file from ${downloadedFilePath}.html to ${info.outputFile}`
              );
            }
          });
          fs.rm(downloadedFilePath, (err) => {
            if (err) {
              console.error(
                `Error removing temp downloaded file ${downloadedFilePath}`
              );
            }
          });
          window.webContents.send("generated-hex-file", {
            path: info.outputFile,
            error: false,
          });
        }
      );
    });
  });

  ipcMain.on("choose-file", (event, info) => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        defaultPath: info.defaultPath,
        filters:
          info.fileTypes && info.fileTypes.length
            ? [{ name: "Files", extensions: info.fileTypes }]
            : [],
        buttonLabel: "Open",
      })
      .then((response) => {
        if (!response.canceled) {
          window.webContents.send("chosen-file", {
            path: response.filePaths[0],
            trigger: info.trigger,
          });
        }
      });
  });

  ipcMain.on("choose-directory", (event, info) => {
    dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
        defaultPath: info.defaultPath,
        buttonLabel: "Open",
      })
      .then((response) => {
        if (!response.canceled) {
          window.webContents.send("chosen-directory", {
            path: response.filePaths[0],
            trigger: info.trigger,
          });
        }
      });
  });

  ipcMain.on("save-config", (event, info) => {
    dialog
      .showSaveDialog({
        properties: ["createDirectory"],
        buttonLabel: "Save",
        defaultPath: "safedocs-config.json",
        filters: [{ name: "Configs", extensions: ["json"] }],
      })
      .then((response) => {
        if (!response.canceled) {
          fs.writeFileSync(response.filePath, JSON.stringify(info, null, 4));
          window.webContents.send("save-config-success");
        }
      });
  });

  ipcMain.on("sync-config", (event, info) => {
    let configPath = path.join(app.getPath("userData"), "safedocs-config.json");
    let config = { mappings: {} };
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath));
      } catch (err) {
        console.error(err);
      }
    }

    if (!app.getPath("userData")) {
      fs.mkdir(app.getPath("userData"), { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
      });
    } else if (info.config && info.config.index) {
      config = info.config;
      config["timestamp"] = new Date().getTime();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    }
    window.webContents.send("config-syncd", {
      config: config,
      trigger: info.trigger,
    });
  });

  ipcMain.on("load-config", (event, info) => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        buttonLabel: "Load",
        filters: [{ name: "Configs", extensions: ["json"] }],
      })
      .then((response) => {
        if (!response.canceled) {
          const config = JSON.parse(fs.readFileSync(response.filePaths[0]));
          window.webContents.send("load-config-success", config);
        }
      });
  });

  ipcMain.on("open-raw-file", (event, info) => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        buttonLabel: "Load",
      })
      .then((response) => {
        if (!response.canceled) {
          let path = response.filePaths[0];
          const contents = fs.readFileSync(path).toString("utf8");
          window.webContents.send("load-contents-success", {
            path,
            trigger: info.trigger,
            contents,
          });
        }
      });
  });

  ipcMain.on("download", (event, info) => {
    info.onProgress = (status) =>
      window.webContents.send("download progress", status);

    dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
        buttonLabel: "Open",
      })
      .then((response) => {
        if (!response.canceled) {
          if (info.urls) {
            info.urls.map((url) => {
              if (info.useS3) {
                let credentials = new AWS.SharedIniFileCredentials({
                  profile: info.awsProfileName,
                });
                AWS.config.update({ credentials });

                let s3 = new AWS.S3();
                if (url.startsWith(info.s3BucketName + "/")) {
                  url = url.replace(info.s3BucketName + "/", "");
                }
                s3.getObject(
                  {
                    Bucket: info.s3BucketName,
                    Key: url,
                  },
                  (err, data) => {
                    if (err) {
                      console.error(err);
                      return;
                    }

                    let destinationPath = path.join(
                      response.filePaths[0],
                      url.split("/")[url.split("/").length - 1]
                    );

                    fs.writeFileSync(destinationPath, data.Body);
                    window.webContents.send(
                      "download complete",
                      destinationPath
                    );
                  }
                );
              } else if (!info.useRawFileLocation) {
                download(BrowserWindow.getFocusedWindow(), url, {
                  directory: response.filePaths[0],
                }).then((dl) =>
                  window.webContents.send("download complete", dl.getSavePath())
                );
              } else {
                let destinationPath = path.join(
                  response.filePaths[0],
                  url.split("/")[url.split("/").length - 1]
                );
                if (fs.existsSync(url)) {
                  fs.copyFileSync(url, destinationPath);
                  window.webContents.send("download complete", destinationPath);
                }
              }
            });
          }
          window.webContents.send("all-downloads-complete");
        }
      });
  });

  ipcMain.on("maximize-app-window", () => {
    window.maximize();
    window.webContents.send("maximize");
  });
  ipcMain.on("unmaximize-app-window", () => {
    window.unmaximize();
    window.webContents.send("minimize");
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    // const parsedUrl = new URL(navigationUrl);
  });
});
