// resetScale.js
export default function resetScale({ purchaseData, setPurchaseData, currentSide, defaultScale = 1 }) {
    setPurchaseData((prevData) => ({
        ...prevData,
        sides: {
            ...prevData.sides,
            [currentSide]: {
                ...prevData.sides[currentSide],
                scale: defaultScale,
            },
        },
    }));
}
