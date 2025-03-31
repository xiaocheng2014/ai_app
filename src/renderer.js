const { ipcRenderer } = require('electron');

let links = [];
let activeIndex = -1;

// 修改 loadLinks 函数确保正确加载数据
async function loadLinks() {
  try {
    links = await ipcRenderer.invoke('get-links');
    renderLinks();
  } catch (error) {
    console.error('加载链接失败:', error);
  }
}

function renderLinks() {
  const linkList = document.getElementById('linkList');
  linkList.innerHTML = '';
  links.forEach((link, index) => {
    const li = document.createElement('li');
    li.textContent = link.name;
    // 添加选中状态的类
    if (index === activeIndex) {
      li.classList.add('active');
    }
    li.onclick = () => {
      // 更新选中状态
      const items = linkList.getElementsByTagName('li');
      for (let item of items) {
        item.classList.remove('active');
      }
      li.classList.add('active');
      activeIndex = index;
      loadUrl(link.url);
    };
    linkList.appendChild(li);
  });
}

function loadUrl(url) {
  const webview = document.getElementById('webview');
  webview.setAttribute('src', url);
}

function addLink() {
  document.getElementById('addLinkModal').style.display = 'block';
  document.getElementById('linkName').value = '';
  document.getElementById('linkUrl').value = '';
}

function cancelAdd() {
  document.getElementById('addLinkModal').style.display = 'none';
}

function confirmAdd() {
  const name = document.getElementById('linkName').value;
  const url = document.getElementById('linkUrl').value;
  if (name && url) {
    links.push({ name, url });
    ipcRenderer.invoke('save-links', links);
    renderLinks();
    cancelAdd();
  }
}

// 修改初始化部分
document.addEventListener('DOMContentLoaded', () => {
  // 初始化 webview
  const webview = document.getElementById('webview');
  webview.addEventListener('dom-ready', () => {
    webview.setWebPreferences({
      webSecurity: false
    });
  });

  // 设置初始欢迎页面
  webview.setAttribute('src', 'welcome.html');

  // 添加链接按钮事件监听
  document.getElementById('addLinkBtn').addEventListener('click', addLink);

  // 加载保存的链接
  loadLinks();
});


// 在文件末尾添加
async function updateShortcut(newShortcut) {
  try {
    const success = await ipcRenderer.invoke('update-shortcut', newShortcut);
    if (success) {
      alert('快捷键设置成功！');
    } else {
      alert('快捷键设置失败，请尝试其他组合键');
    }
  } catch (error) {
    console.error('更新快捷键失败:', error);
    alert('快捷键设置失败');
  }
}

async function getCurrentShortcut() {
  return await ipcRenderer.invoke('get-shortcut');
}

// 在 DOMContentLoaded 事件监听器中添加
document.getElementById('toggleButton').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
});
document.getElementById('settingsBtn').addEventListener('click', openSettings);

// 添加设置相关函数
async function openSettings() {
  document.getElementById('settingsModal').style.display = 'block';
  const currentShortcut = await getCurrentShortcut();
  document.getElementById('shortcutInput').value = currentShortcut;
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

async function saveSettings() {
  const newShortcut = document.getElementById('shortcutInput').value;
  await updateShortcut(newShortcut);
  closeSettings();
}

// 添加快捷键输入处理
document.getElementById('shortcutInput').addEventListener('keydown', (e) => {
  e.preventDefault();
  const keys = [];
  if (e.metaKey) keys.push('Command');
  if (e.ctrlKey) keys.push('Control');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');
  
  if (e.key && !['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
    keys.push(e.key.toUpperCase());
  }
  
  if (keys.length > 0) {
    document.getElementById('shortcutInput').value = keys.join('+');
  }
});