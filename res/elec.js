const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { preloadJs, distDir } = require('./filePath');
const path = require('path');
const { each } = require('./dbLib');
// const tra = require('./tra');
/**
 * 限制 mac
 * if (app.isPackaged) {
 *   const allowMac = require('./mac');
 *   const os = require('os');
 *   const vals =  Object.values(
 *     os.networkInterfaces()
 *   );
 *   if(!vals.some(
 *     item => item.some(
 *       item => allowMac.includes(item.mac)
 *     )
 *   )) {
 *     throw new Error('HELLO :-)');
 *   }
 * }
*/
function createWin () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadJs,
    }
  });
  Menu.setApplicationMenu(null);

  ipcMain.handle('exec', () => each('select * from goods'));

  if(app.isPackaged) {
    win.loadFile(path.resolve(distDir, 'index.html'));
  } else {
    win.loadURL('http://localhost:8080');
    win.webContents.openDevTools({ mode: 'undocked' });
  }
}
app.whenReady().then(createWin);