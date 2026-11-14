/** All measurements are logical pixels (dp), never hardware pixel resolution. */
export function newsLayout(width: number, height: number, fontScale = 1) {
    const pageHeight = Math.max(height, 360 * Math.max(1, fontScale));
    const split = width >= 600;
    const figureSize = split ? Math.min(width * .42, pageHeight * .85, 480)
        : Math.min(width, Math.max(0, pageHeight - 350 * Math.max(1, fontScale)) / .68);
    return { pageHeight, split, figureSize,
        bottomPadding: split ? 20 : Math.max(16, figureSize * .68) };
}
