const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const developmentUrl = "http://127.0.0.1:5173";

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url === "about:blank") {
      return { action: "allow" };
    }

    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url).catch((error) => {
        console.error("Não foi possível abrir o link externo:", error);
      });
    }

    return { action: "deny" };
  });

  const pageLoad = app.isPackaged
    ? window.loadFile(path.join(__dirname, "..", "dist", "index.html"))
    : window.loadURL(developmentUrl);

  pageLoad.catch((error) => {
    console.error("Não foi possível abrir o aplicativo:", error);
  });
}

app.whenReady()
  .then(() => {
    app.setAppUserModelId("org.sesi.laboratorio-emprestimos");
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((error) => {
    console.error("Não foi possível iniciar o aplicativo:", error);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
