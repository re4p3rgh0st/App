const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const DEV = process.argv.includes("--dev");   // "npm run dev" opens with developer tools allowed
let win = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();                                 // only one copy of the app at a time
} else {
  app.on("second-instance", () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);            // no File/Edit/View bar
    win = new BrowserWindow({
      width: 1280, height: 800, minWidth: 900, minHeight: 600,
      backgroundColor: "#050308",
      icon: path.join(__dirname, "icon.ico"),
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        spellcheck: false,
        devTools: DEV
      }
    });
    win.loadFile(path.join(__dirname, "index.html"));

    // links to other websites open in the normal browser, never inside the app
    win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
    win.webContents.on("will-navigate", (e, url) => {
      if (!url.startsWith("file://")) { e.preventDefault(); shell.openExternal(url); }
    });
    // F11 = fullscreen
    win.webContents.on("before-input-event", (e, input) => {
      if (input.type === "keyDown" && input.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    });
    win.on("closed", () => { win = null; });
  });

  app.on("window-all-closed", () => app.quit());
}
