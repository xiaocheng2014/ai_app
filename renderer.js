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

  // 添加链接按钮事件监听
  document.getElementById('addLinkBtn').addEventListener('click', addLink);

  // 加载保存的链接
  loadLinks();
});