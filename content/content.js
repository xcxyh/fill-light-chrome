// 创建覆盖层
let overlay = document.createElement('div');
overlay.className = 'fill-light-overlay';

// 将覆盖层添加到页面
document.body.appendChild(overlay);

// 从存储中加载上次的颜色
chrome.storage.local.get(['fillColor'], function (result) {
    if (result.fillColor) {
        overlay.style.backgroundColor = result.fillColor;
    }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'UPDATE_COLOR') {
        overlay.style.backgroundColor = request.color;
    }
});