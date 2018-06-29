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
