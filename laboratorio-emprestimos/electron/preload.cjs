const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", {
  isDesktopApp: true
});
