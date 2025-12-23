export default function getMaxUniformScale({ rect, img }) {
    // Mittelpunkt der Grafik (der Group) …
    const cx = img.xPosition + (img.width * img.scale) / 2;
    const cy = img.yPosition + (img.height * img.scale) / 2;

    // Wie viel Platz bis zum jeweiligen Rand?
    const distLeft = cx - rect.x;
    const distRight = rect.x + rect.width - cx;
    const distTop = cy - rect.y;
    const distBottom = rect.y + rect.height - cy;

    // jeweils Doppel-Distanz / Original-Breite bzw. -Höhe
    const maxScaleX = (Math.min(distLeft, distRight) * 2) / img.width;
    const maxScaleY = (Math.min(distTop, distBottom) * 2) / img.height;

    return Math.min(maxScaleX, maxScaleY);
}
