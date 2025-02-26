const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  cwd: path.join(app.getPath('home'), '.ai_app')
});

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  mainWindow.loadFile('index.html');
}

function toggleWindow() {
  if (mainWindow === null) {
    createWindow();
  } else if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

app.whenReady().then(() => {
  // 注册全局快捷键 (Command+Shift+A)
  globalShortcut.register('CommandOrControl+B', toggleWindow);
  createWindow();
});

// 当所有窗口关闭时，不要退出应用
app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-links', () => {
  return store.get('links', []);
});

ipcMain.handle('save-links', (event, links) => {
  store.set('links', links);
  return true;
});

// 在其他 ipcMain handlers 后添加
ipcMain.handle('show-input-dialog', async () => {
  const result = await dialog.showMessageBox({
    title: '添加链接',
    buttons: ['确定', '取消'],
    type: 'question',
    message: '请输入链接信息',
    defaultId: 0,
    cancelId: 1,
    inputFields: [
      {
        label: '名称',
        type: 'text'
      },
      {
        label: 'URL',
        type: 'text'
      }
    ]
  });
  
  if (result.response === 0) {
    return {
      name: result.inputFields[0],
      url: result.inputFields[1]
    };
  }
  return null;
});