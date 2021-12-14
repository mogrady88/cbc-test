#!/usr/bin/env node

const fs = require("fs");
const exec = require("child_process").exec;
const path = require("path");
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath));

const supportedBrowsers = config.supportedBrowsers;
const disabledBrowsers = config.disabledBrowsers;

const writeToConfig = () => {
  fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
    if (err) console.error(err);
  });
};

const checkForBrowserSupport = (browser) => {
  return supportedBrowsers.includes(browser);
};

const checkForDisabledBrowser = (browser) => {
  return disabledBrowsers.includes(browser);
};

const openBrowser = (e, remote) => {
  const browser = e ? e : process.argv.slice(1).join(" ");
  if (!checkForBrowserSupport(browser)) {
    return `Browser: ${browser} is not supported`;
  }
  remote
    ? exec(`/usr/bin/open -a ${browser} http://${config.remoteURL}`)
    : exec(
        `/usr/bin/open -a ${browser} http://localhost:${config.localHostPort}`
      );
};

const enableAllBrowsers = () => {
  config.disabledBrowsers = [];
  writeToConfig();
};

const openRemoteBrowsers = () => {
  supportedBrowsers.forEach((e) => {
    if (!disabledBrowsers.includes(e)) openBrowser(e, true);
  });
};

const openLocalBrowsers = () => {
  supportedBrowsers.forEach((e) => {
    if (!disabledBrowsers.includes(e)) openBrowser(e, false);
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
  if (url.startsWith("https://")) url = url.substring(8);
  config.remoteURL = url;
  writeToConfig();
};

const setLocalHost = (port) => {
  if (!Number(port) || port > 9999) {
    return `Localhost port should be a 4 digit number: ${port}`;
  }
  config.localHostPort = Number(port);
  writeToConfig();
};

const showSupported = () => console.log(config.supportedBrowsers);
const showDisabled = () => console.log(config.disabledBrowsers);

const showConfig = () => {
  console.log(
    `
    Settings:
    
    Localhost port:  ${config.localHostPort}
    Remote URL: ${config.remoteURL}
    Supported browsers: ${config.supportedBrowsers.join(", ")}
    Disabled browsers: ${config.disabledBrowsers.join(", ")}
    
    `
  );
};

const showCbcOptions = () => {
  console.log(`
  
                          CBC - Cross Browser Compatability
 
          Test your builds on several browsers at once. See local and remote
        options or test in a particular browser. Available commands are below:

  'cbc'                                        --open all supported browsers (local and remote)
  'cbc local'                                  --open all supported browsers at localhost
  'cbc remote'                                 --open all supported browsers at remote url
  'cbc single {browserName} {boolean}'         --open a single browser and designate local or remote with a boolean (remote=true)
  'cbc set-port {number}'                      --update your localhost port (default is 6061)
  'cbc set-remote {url}                        --update your remote url for testing ( no http - that is handled in the execution)
  'cbc disable {browserName}'                  --add selected browser to the list of disabled
  'cbc enable-all'                             --clear all previously disabled browsers
  'cbc settings'                               --show all current settings
  'cbc show-supported'                         --show all supported browsers for this package
  'cbc show-disabled'                          --show all of the browsers you have disabled
  'cbc help'                                   --i mean... you get it, right?

  `);
};

switch (process.argv[2]) {
  case "single":
    openBrowser(process.argv[3], process.argv[4]);
    break;
  case "local":
    openLocalBrowsers();
    break;
  case "remote":
    openRemoteBrowsers();
    break;
  case "set-port":
    setLocalHost(process.argv[3]);
    break;
  case "set-remote":
    setRemoteUrl(process.argv[3]);
    break;
  case "help":
    showCbcOptions();
    break;
  case "disable":
    disableBrowser(process.argv[3]);
    break;
  case "enable-all":
    enableAllBrowsers();
    break;
  case "show-supported":
    showSupported();
    break;
  case "show-disabled":
    showDisabled();
    break;
  case "settings":
    showConfig();
    break;
  default:
    openLocalBrowsers();
    openRemoteBrowsers();
}
