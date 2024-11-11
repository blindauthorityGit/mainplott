export default function handleDeleteUpload({ purchaseData, setPurchaseData, currentSide }) {
    setPurchaseData({
        ...purchaseData,
        sides: {
            ...purchaseData.sides,
            [currentSide]: {
                ...purchaseData.sides[currentSide],
                uploadedGraphic: null,
                uploadedGraphicFile: null,
            },
        },
    });
}
