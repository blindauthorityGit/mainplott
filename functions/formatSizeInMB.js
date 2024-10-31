export default function formatSizeInMB(sizeInBytes) {
    if (typeof sizeInBytes !== "number" || sizeInBytes < 0) {
        return "Invalid size";
    }

    const sizeInMB = sizeInBytes / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
}
