const FAVICON_SIZE = 64;
const FAVICON_BORDER_RADIUS = 12;
const BACKGROUNDS_URL = '/data.json';

const favicon = document.querySelector('link[rel="icon"]');
const container = document.querySelector('.backgrounds');

const context = getCanvasContext();
const worker = new Worker('worker.js');

function getCanvasContext() {
    const canvas = document.createElement('canvas');
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;
    return canvas.getContext('2d');
}

function loadImage(url) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    return new Promise(resolve => {
        image.onload = () => resolve(image);
    });
}

function drawRoundedClip(context, size, radius) {
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(size - radius, 0);
    context.quadraticCurveTo(size, 0, size, radius);
    context.lineTo(size, size - radius);
    context.quadraticCurveTo(size, size, size - radius, size);
    context.lineTo(radius, size);
    context.quadraticCurveTo(0, size, 0, size - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.clip();
}

function getSquareCenterBounds(image) {
    const isPortrait = image.width < image.height;
    return {
        x: isPortrait ? 0 : (image.width - image.height) / 2,
        y: isPortrait ? (image.height - image.width) / 2 : 0,
        width: isPortrait ? image.width : image.height,
        height: isPortrait ? image.width : image.height
    };
}

async function createFaviconLocally({foreground, background, size, borderRadius}) {
    [foreground, background] = await Promise.all([
        loadImage(foreground),
        loadImage(background)
    ]);

    drawRoundedClip(context, size, borderRadius);
    const bgCenter = getSquareCenterBounds(background);
    const fgCenter = getSquareCenterBounds(foreground);

    context.drawImage(
        background,
        bgCenter.x, bgCenter.y, bgCenter.width, bgCenter.height,
        0, 0, size, size
    );

    context.drawImage(
        foreground,
        fgCenter.x, fgCenter.y, fgCenter.width, fgCenter.height,
        0, 0, size, size
    );

    return context.canvas.toDataURL('image/png');
}

function createFaviconInWorker(options) {
    worker.postMessage(options);

    return new Promise(resolve => {
        worker.addEventListener('message', e => {
            resolve(e.data);
        }, {once: true});
    });
}

function createFavicon(...args) {
    return window.OffscreenCanvas
        ? createFaviconInWorker(...args)
        : createFaviconLocally(...args);
}

function fetchBackgrounds() {
    return fetch(BACKGROUNDS_URL).then(response => response.json());
}

function displayBackgrounds(backgrounds) {
    backgrounds.forEach(background => {
        const image = new Image();
        image.src = background.url;

        const wrapper = document.createElement('div');
        wrapper.appendChild(image);

        container.appendChild(wrapper);
    });
}

async function selectBackground(url) {
    const selected = container.querySelector('.selected')
    if (selected) {
        selected.classList.remove('selected');
    }
    container.querySelector(`img[src="${url}"]`).parentNode.classList.add('selected');

    favicon.href = await createFavicon({
        foreground: '/icon.png',
        background: url,
        size: FAVICON_SIZE,
        borderRadius: FAVICON_BORDER_RADIUS
    });
}

(async () => {
    const backgrounds = await fetchBackgrounds();
    displayBackgrounds(backgrounds);

    selectBackground(backgrounds[0].url);

    container.addEventListener('click', e => {
        if (e.target.matches('img')) {
            selectBackground(e.target.getAttribute('src'));
        }
    });
})();
