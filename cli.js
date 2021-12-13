#!/usr/bin/env node
const openBrowser = () => {
  const browser = process.argv.slice(1).join(" ");
  if (!checkForBrowserSupport(browser))
    return `Browser: ${browser} is not supported`;
  exec(`open -a ${browser} http://${config.remoteURL}`);
  if (localHostPort) {
    exec(`open -a ${browser} http://localhost:${config.localHostPort}`);
  }
};

const enableAllBrowsers = () => {
  config.disabledBrowsers = [];
  writeToConfig();
};

const openBrowsers = () => {
  supportedBrowsers.forEach((e) => {
    if (disabledBrowsers.includes(e)) return;
    openBrowser(e);
  });
};

const disableBrowser = (browserToDisable) => {
  if (!checkForBrowserSupport(browserToDisable)) {
    const browserString = supportedBrowsers.join(", ");
    return `Error: Browser names are case-sensitive. Please select from the following: ${browserString}`;
  }
  if (!checkForDisabledBrowser(browserToDisable)) {
    config.disabledBrowsers.push(browserToDisable);
  }
  writeToConfig();
};

const setRemoteUrl = (url) => {
  if (typeof url !== "string") return "URL must be a string";
  if (url.startsWith("http://")) url = url.substring(7);
  config.remoteURL = url;
  writeToConfig();
};

const setLocalHost = (port) => {
  if (!Number(port) || port > 9999) {
    return `Localhost port should be a number: ${port}`;
  }
  config.localHostPort = Number(port);
  writeToConfig();
};

module.exports = {
  openBrowser,
  openBrowsers,
  setRemoteUrl,
  setLocalHost,
  disableBrowser,
  enableAllBrowsers,
};

/*------------------------------ Helper Functions --------------------------------------*/

const fs = require("fs");
const exec = require("child_process").exec;
const path = require("path");
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath));

const supportedBrowsers = config.supportedBrowsers;
const disabledBrowsers = config.disabledBrowsers;
const localHostPort = config.localHostPort;

const writeToConfig = () => {
  fs.writeFile(configPath, JSON.stringify(config, null, 2), (err, data) => {
    if (err) console.error(err);
    console.log(data);
  });
};

const checkForBrowserSupport = (browser) => {
  return supportedBrowsers.includes(browser);
};

const checkForDisabledBrowser = (browser) => {
  return disabledBrowsers.includes(browser);
};
