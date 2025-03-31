const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 读取 package.json 中的配置
const packageJson = require('./package.json');
const appDataPath = packageJson.config?.appDataPath || '.ai_app';

const store = new Store({
  cwd: path.join(app.getPath('home'), appDataPath),
  defaults: {
    shortcut: 'CommandOrControl+B'
  }
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

  mainWindow.loadFile('src/index.html');
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
  const shortcut = store.get('shortcut');
  globalShortcut.register(shortcut, toggleWindow);
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

// 在 ipcMain handlers 部分添加
ipcMain.handle('update-shortcut', (event, newShortcut) => {
  try {
    // 先注销旧的快捷键
    globalShortcut.unregisterAll();
    // 注册新的快捷键
    globalShortcut.register(newShortcut, toggleWindow);
    // 保存新的快捷键
    store.set('shortcut', newShortcut);
    return true;
  } catch (error) {
    console.error('快捷键设置失败:', error);
    // 如果设置失败，恢复到之前的快捷键
    const oldShortcut = store.get('shortcut');
    globalShortcut.register(oldShortcut, toggleWindow);
    return false;
  }
});

ipcMain.handle('get-shortcut', () => {
  return store.get('shortcut');
});

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