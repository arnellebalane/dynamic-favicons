const FAVICON_SIZE = 64;
const FAVICON_BORDER_RADIUS = 5;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

function loadImage(url) {
    const image = new Image();
    image.src = url;

    return new Promise(resolve => {
        image.onload = () => resolve(image);
    });
}

function drawRoundedClip(size, radius) {
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

function createFavicon({foreground, background, size, borderRadius}) {
    drawRoundedClip(size, borderRadius);
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
}

Promise.all([
    loadImage('/icon.png'),
    loadImage('/background.jpg')
]).then(([icon, background]) => {
    createFavicon({
        foreground: icon,
        background,
        size: FAVICON_SIZE,
        borderRadius: FAVICON_BORDER_RADIUS
    });
});
