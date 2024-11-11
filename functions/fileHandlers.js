// fileHandlers.js

export function handleShowDetails(uploadedFile, setModalOpen) {
    if (uploadedFile) {
        setModalOpen(true);
    }
}

export function handleDeleteUpload({ setUploadedFile, setPurchaseData, purchaseData, currentSide }) {
    setUploadedFile(null);
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
