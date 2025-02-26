const { ipcRenderer } = require('electron');

let links = [];

async function loadLinks() {
  links = await ipcRenderer.invoke('get-links');
  renderLinks();
}

function renderLinks() {
  const linkList = document.getElementById('linkList');
  linkList.innerHTML = '';
  links.forEach((link, index) => {
    const li = document.createElement('li');
    li.textContent = link.name;
    li.onclick = () => loadUrl(link.url);
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

// 初始化 webview
const webview = document.getElementById('webview');
webview.addEventListener('dom-ready', () => {
  // 设置 webview 的 CSP
  webview.setWebPreferences({
    webSecurity: false
  });
});

// Add event listener for the add link button
document.getElementById('addLinkBtn').addEventListener('click', addLink);

// 加载保存的链接
loadLinks();