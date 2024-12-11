// centerVertically.js

export default function centerVertically({ purchaseData, setPurchaseData, currentSide }) {
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
