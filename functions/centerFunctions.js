// centerFunctions.js

export function centerVertically({ purchaseData, setPurchaseData, currentSide }) {
    const { containerHeight } = purchaseData;
    if (!containerHeight) {
        console.warn("Cannot center vertically: containerHeight is not set.");
        return;
    }

    const newY = containerHeight / 2;

    setPurchaseData((prevData) => ({
        ...prevData,
        sides: {
            ...prevData.sides,
            [currentSide]: {
                ...prevData.sides[currentSide],
                yPosition: newY,
            },
        },
    }));
}

export function centerHorizontally({ purchaseData, setPurchaseData, currentSide }) {
    const { containerWidth } = purchaseData;
    if (!containerWidth) {
        console.warn("Cannot center horizontally: containerWidth is not set.");
        return;
    }

    const newX = containerWidth / 2;

    setPurchaseData((prevData) => ({
        ...prevData,
        sides: {
            ...prevData.sides,
            [currentSide]: {
                ...prevData.sides[currentSide],
                xPosition: newX,
            },
        },
    }));
}
