document.addEventListener('DOMContentLoaded', function () {
    const openLightBtn = document.getElementById('openLight');

    openLightBtn.addEventListener('click', function () {
        const indexUrl = chrome.runtime.getURL('index.html');
        chrome.tabs.create({
            url: indexUrl
        });
    });
});