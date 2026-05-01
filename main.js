const { app, BrowserWindow, ipcMain, screen, session } = require('electron');

let mainWindow;
let miniWindow;
let isMini = false;

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');

function sendToWebview(js) {
  if (!mainWindow) return;
  mainWindow.webContents.executeJavaScript(
    '(function(){var wv=document.getElementById("sc-webview");if(wv)wv.executeJavaScript(' + JSON.stringify(js) + ').catch(function(){});})()'
  ).catch(function(){});
}

function playPause() {
  sendToWebview('(function(){var s=["button.playControls__play","button[title=\'Play\']","button[title=\'Pause\']","[aria-label=\'Play\']","[aria-label=\'Pause\']"];for(var i=0;i<s.length;i++){var el=document.querySelector(s[i]);if(el){el.click();return;}}document.body.dispatchEvent(new KeyboardEvent("keydown",{keyCode:32,bubbles:true}));})()');
}

function skipNext() {
  sendToWebview('(function(){var s=["button.skipControl__next","[aria-label=\'Next\']","button[title=\'Next\']"];for(var i=0;i<s.length;i++){var el=document.querySelector(s[i]);if(el){el.click();return;}}})()');
}

function skipPrev() {
  sendToWebview('(function(){var s=["button.skipControl__previous","[aria-label=\'Previous\']","button[title=\'Previous\']"];for(var i=0;i<s.length;i++){var el=document.querySelector(s[i]);if(el){el.click();return;}}})()');
}

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
      webviewTag: true,
      backgroundThrottling: false,
      webSecurity: false,
    },
    show: false,
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  session.defaultSession.webRequest.onBeforeSendHeaders(function(details, callback) {
    var headers = Object.assign({}, details.requestHeaders);
    delete headers['X-Requested-With'];
    Object.keys(headers).forEach(function(key) {
      if (key.toLowerCase().includes('electron')) delete headers[key];
    });
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    callback({ requestHeaders: headers });
  });

  mainWindow.webContents.session.setPermissionRequestHandler(function(wc, permission, callback) {
    callback(true);
  });

  mainWindow.webContents.session.setPermissionCheckHandler(function() {
    return true;
  });

  mainWindow.once('ready-to-show', function() { mainWindow.show(); });

  mainWindow.on('closed', function() {
    mainWindow = null;
    if (miniWindow) miniWindow.close();
  });
}

function createMiniWindow() {
  var display = screen.getPrimaryDisplay().workAreaSize;
  var sw = display.width;
  var sh = display.height;

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
  miniWindow.once('ready-to-show', function() { miniWindow.show(); });
  miniWindow.on('closed', function() { miniWindow = null; });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  if (!mainWindow) createMainWindow();
});

ipcMain.on('toggle-mini', function() {
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

ipcMain.on('expand-player', function() {
  if (miniWindow) miniWindow.close();
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.restore();
  }
  isMini = false;
});

ipcMain.on('minimize-window', function() { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('maximize-window', function() {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) { mainWindow.unmaximize(); } else { mainWindow.maximize(); }
});
ipcMain.on('close-window', function() { app.quit(); });

ipcMain.on('move-mini', function(e, data) {
  if (!miniWindow) return;
  var pos = miniWindow.getPosition();
  miniWindow.setPosition(pos[0] + data.dx, pos[1] + data.dy);
});

ipcMain.on('mini-play-pause', function() { playPause(); });
ipcMain.on('mini-next', function() { skipNext(); });
ipcMain.on('mini-prev', function() { skipPrev(); });
