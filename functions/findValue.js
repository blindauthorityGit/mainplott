export default function findValue(array, targetKey, targetValue) {
    for (const item of array) {
        // Check if the current object has the target key with the desired value
        if (item[targetKey] === targetValue) {
            return item;
        }

        // Iterate through the keys to find nested arrays
        for (const key in item) {
            if (Array.isArray(item[key])) {
                const found = findValue(item[key], targetKey, targetValue);
                if (found) {
                    return found;
                }
            }
        }
    }

    return null;
}
