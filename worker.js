addEventListener('message', async e => {
    const favicon = URL.createObjectURL(await createFavicon(e.data));
    postMessage(favicon);
});

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

async function createFavicon({foreground, background, size, borderRadius}) {
    [foreground, background] = await Promise.all([
        loadImage(foreground),
        loadImage(background)
    ]);

    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');

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

    return canvas.convertToBlob({type: 'image/png'});
}
