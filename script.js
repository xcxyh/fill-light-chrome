class ColorSettings {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.loadInitialColor();
    }

    initElements() {
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeButton = document.querySelector('.close-button');
        this.colorPicker = document.getElementById('colorPicker');
        this.preview = document.getElementById('colorPreview');
    }

    initEventListeners() {
        // 设置面板的显示和隐藏
        this.settingsButton.addEventListener('click', () => this.togglePanel(true));
        this.closeButton.addEventListener('click', () => this.togglePanel(false));

        // 颜色选择器事件
        this.colorPicker.addEventListener('input', (e) => this.updateBackground(e.target.value));

        // 点击面板外关闭
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    togglePanel(show) {
        this.settingsPanel.style.display = show ? 'block' : 'none';
        this.settingsButton.style.display = show ? 'none' : 'block';
    }

    updateBackground(color) {
        document.body.style.backgroundColor = color;
        this.preview.style.backgroundColor = color;
        chrome.storage.local.set({ fillColor: color });
    }

    loadInitialColor() {
        chrome.storage.local.get(['fillColor'], (result) => {
            if (result.fillColor) {
                this.colorPicker.value = result.fillColor;
                this.updateBackground(result.fillColor);
            }
        });
    }

    handleOutsideClick(e) {
        if (!this.settingsPanel.contains(e.target) &&
            e.target !== this.settingsButton &&
            this.settingsPanel.style.display === 'block') {
            this.togglePanel(false);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ColorSettings();
});

document.addEventListener('DOMContentLoaded', function () {
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeButton = settingsPanel.querySelector('.close-button');

    // 打开设置面板
    settingsButton.addEventListener('click', function () {
        settingsPanel.classList.add('active');
        settingsButton.style.display = 'none';
        fullscreenButton.style.display = 'none';
    });

    // 关闭设置面板
    closeButton.addEventListener('click', function () {
        settingsPanel.classList.remove('active');
        settingsButton.style.display = 'block';
        fullscreenButton.style.display = 'flex';
    });

    // 点击面板外部关闭设置
    window.addEventListener('click', function (event) {
        if (event.target === settingsPanel) {
            settingsPanel.classList.remove('active');
        }
    });
});

let currentHue = 0;
let currentSaturation = 100;
let currentLightness = 50;

const colorArea = document.getElementById('colorArea');
const hueSlider = document.getElementById('hueSlider');
const lightnessSlider = document.getElementById('lightnessSlider');
const pointer = document.querySelector('.color-pointer');
const hexValue = document.getElementById('hexValue');

// 更新颜色区域的背景
function updateColorArea() {
    const gradientColor = `hsl(${currentHue}, 100%, 50%)`;
    colorArea.style.background = `
        linear-gradient(to bottom, transparent, #000),
        linear-gradient(to right, #fff, ${gradientColor})
    `;
}

// 更新亮度滑块的背景
function updateLightnessSlider() {
    lightnessSlider.style.background = `
        linear-gradient(to right,
            hsl(${currentHue}, ${currentSaturation}%, 0%),
            hsl(${currentHue}, ${currentSaturation}%, 50%),
            hsl(${currentHue}, ${currentSaturation}%, 100%)
        )
    `;
}

// HSL 转 HEX
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// 更新颜色显示
function updateColor(x, y) {
    const rect = colorArea.getBoundingClientRect();
    const saturation = (x / rect.width) * 100;
    const lightness = 100 - (y / rect.height) * 100;

    currentSaturation = Math.min(100, Math.max(0, saturation));
    currentLightness = Math.min(100, Math.max(0, lightness));

    const hex = hslToHex(currentHue, currentSaturation, currentLightness);
    hexValue.textContent = hex.toUpperCase();
    document.body.style.backgroundColor = hex;
    updateLightnessSlider();
}

// 处理颜色区域的点击和拖动
let isDragging = false;

colorArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePointer(e);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updatePointer(e);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function updatePointer(e) {
    const rect = colorArea.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;

    updateColor(x, y);
}

// 处理色相滑块
hueSlider.addEventListener('input', (e) => {
    currentHue = parseInt(e.target.value);
    updateColorArea();
    updateColor(
        parseFloat(pointer.style.left || '0'),
        parseFloat(pointer.style.top || '0')
    );
});

// 添加亮度滑块事件监听
lightnessSlider.addEventListener('input', (e) => {
    currentLightness = parseInt(e.target.value);
    const hex = hslToHex(currentHue, currentSaturation, currentLightness);
    hexValue.textContent = hex.toUpperCase();
    document.body.style.backgroundColor = hex;
});

// 初始化时加载保存的颜色
chrome.storage.local.get(['fillColor'], (result) => {
    if (result.fillColor) {
        document.body.style.backgroundColor = result.fillColor;
    }
});

// 初始化
updateColorArea();

// 替换原有的设置按钮点击事件
document.getElementById('settingsButton').addEventListener('click', function () {
    const settingsPanel = document.getElementById('settingsPanel');
    // 切换显示/隐藏状态
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
    } else {
        settingsPanel.classList.add('show');
    }
});

// 修改点击外部区域关闭的逻辑，只在点击下半部分时关闭
window.addEventListener('click', function (event) {
    const modal = document.getElementById('settingsPanel');
    const modalContent = modal.querySelector('.modal-content');
    if (event.target === modal && event.clientY > window.innerHeight / 2) {
        modal.classList.remove('show');
    }
});

// 获取关闭按钮和设置面板元素
const closeButton = document.getElementById('closeButton');
const settingsPanel = document.getElementById('settingsPanel');

// 添加关闭按钮点击事件
closeButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
});

const fullscreenButton = document.getElementById('fullscreenButton');
const settingsButton = document.getElementById('settingsButton');

fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        // 进入全屏时隐藏按钮
        fullscreenButton.style.display = 'none';
        settingsButton.style.display = 'none';
    } else {
        document.exitFullscreen();
    }
});

// 监听全屏变化事件
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        // 退出全屏时显示按钮
        fullscreenButton.style.display = 'flex';
        settingsButton.style.display = 'block';
    }
});

function setBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}

// 在页面加载时应用保存的背景色
document.addEventListener('DOMContentLoaded', () => {
    const savedColor = getCurrentBackgroundColor();
    setBackgroundColor(savedColor);
});