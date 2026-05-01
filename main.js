const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const path = require('path');

let mainWindow;
let miniWindow;
let isMini = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 550,
    frame: false,
    backgroundColor: '#0e0e0e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    show: false,
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (miniWindow) miniWindow.close();
  });
}

function createMiniWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  miniWindow = new BrowserWindow({
    width: 340,
    height: 90,
    x: sw - 360,
    y: sh - 110,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  miniWindow.loadFile('mini.html');
  miniWindow.once('ready-to-show', () => miniWindow.show());

  miniWindow.on('closed', () => {
    miniWindow = null;
  });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createMainWindow();
});

// IPC: toggle mini player
ipcMain.on('toggle-mini', () => {
  if (!isMini) {
    mainWindow.hide();
    createMiniWindow();
    isMini = true;
  } else {
    if (miniWindow) miniWindow.close();
    mainWindow.show();
    mainWindow.focus();
    isMini = false;
  }
});

// Mini player expand back
ipcMain.on('expand-player', () => {
  if (miniWindow) miniWindow.close();
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.restore(); // un-minimize if minimized
  }
  isMini = false;
});

// Window controls
ipcMain.on('minimize-window', () => mainWindow && mainWindow.minimize());
ipcMain.on('maximize-window', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('close-window', () => app.quit());

// Drag mini window
ipcMain.on('move-mini', (e, { dx, dy }) => {
  if (!miniWindow) return;
  const [x, y] = miniWindow.getPosition();
  miniWindow.setPosition(x + dx, y + dy);
});
