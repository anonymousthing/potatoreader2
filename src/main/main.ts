import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });
  win.loadFile('index.html');
}

app.on('ready', createWindow);
