const FAVICON_SIZE = 32;

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

Promise.all([
    loadImage('/icon.png'),
    loadImage('/background.jpg')
]).then(([icon, background]) => {
    drawRoundedClip(FAVICON_SIZE, 5);
    const center = getSquareCenterBounds(background);

    context.drawImage(
        background,
        center.x, center.y, center.width, center.height,
        0, 0, FAVICON_SIZE, FAVICON_SIZE
    );

    context.drawImage(
        icon,
        0, 0, icon.width, icon.height,
        0, 0, FAVICON_SIZE, FAVICON_SIZE
    );
});
