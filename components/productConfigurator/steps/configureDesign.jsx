import React, { useState, useEffect } from "react";
import { Slider, Tabs, Tab, Checkbox, FormControlLabel, Button } from "@mui/material";
import { P } from "@/components/typography";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { FiX, FiInfo } from "react-icons/fi";
import { IconButton } from "@/components/buttons"; // Adjust import path as needed
// import { handleShowDetails, handleDeleteUpload } from "@/functions/fileHandlers";

// Importing the trash, info, and refresh icons
import handleDeleteUpload from "@/functions/handleDeleteUpload";
import handleShowDetails from "@/functions/handleShowDetail";
import handleFileUpload from "@/functions/handleFileUpload";

export default function ConfigureDesign({ product, setCurrentStep, steps, currentStep }) {
    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,
        setModalOpen,
        setColorSpace,
        setModalContent,
        setDpi,
        setShowSpinner,
    } = useStore();
    const [activeTab, setActiveTab] = useState(0); // Track which tab is active
    const [copyFrontToBack, setCopyFrontToBack] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const containerWidth = purchaseData.containerWidth || 500; // Set a default value for safety
    const containerHeight = purchaseData.containerHeight || 500;

    const currentSide = activeTab === 0 ? "front" : "back";

    const handleXChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    xPosition: newValue,
                },
            },
        });
    };

    const handleYChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    yPosition: newValue,
                },
            },
        });
    };

    const handleScaleChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    scale: newValue,
                },
            },
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPurchaseData({
            ...purchaseData,
            currentSide: newValue === 0 ? "front" : "back",
        });
    };
    const handleCopyFrontToBack = (event) => {
        const isChecked = event.target.checked;
        setCopyFrontToBack(isChecked);
        console.log(purchaseData);

        if (isChecked && purchaseData.sides.front.uploadedGraphic) {
            const centeredX = purchaseData.containerWidth / 2;
            const centeredY = purchaseData.containerHeight / 2;

            // Copy front design to back, with a new entry in purchaseData and centered position
            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides, // Keep both front and back
                    back: {
                        ...purchaseData.sides.front, // Copy all front design properties to back
                        xPosition: centeredX, // Set to centered position
                        yPosition: centeredY,
                    },
                },
            });
        }
    };

    const handleGraphicUpload = async (event) => {
        const newFile = event.target.files[0];
        console.log(newFile);
        const centeredX = purchaseData.containerWidth / 2;
        const centeredY = purchaseData.containerHeight / 2;
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides, // Keep both front and back
                back: {
                    ...purchaseData.sides.front, // Copy all front design properties to back
                    xPosition: centeredX, // Set to centered position
                    yPosition: centeredY,
                },
            },
        });
        if (newFile) {
            await handleFileUpload({
                newFile,
                currentSide,
                purchaseData,
                setUploadedFile,
                setPurchaseData,
                setModalOpen,
                setShowSpinner, // Optionally create a spinner state to handle UI feedback
                setModalContent,
                setUploading,
                setUploadError,
                setColorSpace,
                setDpi,
                steps,
                currentStep,
                setCurrentStep,
            });
        }
    };

    const handleRotateImage = () => {
        setPurchaseData({
            ...purchaseData,
            currentSide: purchaseData.currentSide === "front" ? "back" : "front",
        });
    };

    const stepData = {
        title: "Design anpassen",
        // description: "Passen Sie das Design auf dem Produkt an.",
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={stepData} />

            {/* Material-UI Tabs Component */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="Product side tabs"
                className="mb-8 font-body text-xl"
                style={{ color: "#4f46e5" }} // Inline style to override default MUI color
                sx={{
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#ba979d", // Replace with your Tailwind primary color
                    },
                    "& .Mui-selected": {
                        color: "#393836!important", // Selected tab color
                        fontWeight: "bold", // Bold text for the active tab
                    },
                    "& .MuiTab-root": {
                        minWidth: 0, // Minimize width for better styling control
                        padding: "0.75rem 1.5rem", // Add custom padding
                        transition: "color 0.3s", // Smooth color transition
                    },
                }}
            >
                <Tab
                    label="Vorderseite"
                    className="text-xl font-semibold text-textColor px-4 py-2 hover:text-primaryColor transition-colors duration-300"
                />
                {selectedVariant.backImageUrl && (
                    <Tab
                        label="Rückseite"
                        className="text-lg font-semibold text-textColor px-4 py-2 hover:text-primaryColor transition-colors duration-300"
                    />
                )}
            </Tabs>

            {/* Upload Button Section */}
            {!purchaseData.sides[currentSide].uploadedGraphicFile ? (
                <Button
                    variant="contained"
                    component="label"
                    sx={{
                        mt: 1.5, // Tailwind equivalent for `mt-6`
                        px: 3, // Tailwind equivalent for `px-6`
                        py: 1, // Tailwind equivalent for `py-2`
                        backgroundColor: "#ba979d", // Replace 'primaryColor.main' with your Tailwind color code if needed
                        color: "white", // Text color
                        fontFamily: "Montserrat", // Replace with your Tailwind font family if specified in your theme
                        borderRadius: "8px", // Adjust to match your rounded-lg styling
                        "&:hover": {
                            backgroundColor: "primaryColor.light", // Replace with your Tailwind hover color
                        },
                        boxShadow: "none", // Removes Material-UI button shadow
                    }}
                >
                    Datei hochladen
                    <input type="file" hidden onChange={handleGraphicUpload} />
                </Button>
            ) : (
                <>
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">X-Achse Position</P>
                        <Slider
                            value={purchaseData.sides[currentSide].xPosition}
                            min={0} // Minimum position on the X-axis
                            max={containerWidth} // Maximum position on the X-axis
                            onChange={handleXChange}
                            aria-labelledby="x-axis-slider"
                            sx={{
                                "& .MuiSlider-thumb": {
                                    backgroundColor: "#393836", // Customize the thumb color
                                    width: 20, // Thumb width
                                    height: 20, // Thumb height
                                    border: "2px solid white", // Add a border for visibility
                                    "&:hover, &.Mui-focusVisible": {
                                        boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)", // Add hover/focus effect
                                    },
                                },
                                "& .MuiSlider-track": {
                                    backgroundColor: "#B0D0D3", // Track color
                                    height: 6, // Track thickness
                                    border: "none",
                                },
                                "& .MuiSlider-rail": {
                                    backgroundColor: "#EBE0E1", // Rail color (default, unfilled area)
                                    height: 6, // Rail thickness
                                },
                                "& .MuiSlider-valueLabel": {
                                    backgroundColor: "#4f46e5", // Background color for value label
                                    color: "white", // Value label text color
                                    fontSize: "0.875rem", // Font size for value label
                                },
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">Y-Achse Position</P>
                        <Slider
                            value={purchaseData.sides[currentSide].yPosition}
                            min={0} // Minimum position on the Y-axis
                            max={containerHeight} // Maximum position on the Y-axis
                            onChange={handleYChange}
                            aria-labelledby="y-axis-slider"
                            sx={{
                                "& .MuiSlider-thumb": {
                                    backgroundColor: "#393836", // Customize the thumb color
                                    width: 20, // Thumb width
                                    height: 20, // Thumb height
                                    border: "2px solid white", // Add a border for visibility
                                    "&:hover, &.Mui-focusVisible": {
                                        boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)", // Add hover/focus effect
                                    },
                                },
                                "& .MuiSlider-track": {
                                    backgroundColor: "#B0D0D3", // Track color
                                    height: 6, // Track thickness
                                    border: "none",
                                },
                                "& .MuiSlider-rail": {
                                    backgroundColor: "#EBE0E1", // Rail color (default, unfilled area)
                                    height: 6, // Rail thickness
                                },
                                "& .MuiSlider-valueLabel": {
                                    backgroundColor: "#EBE0E1", // Background color for value label
                                    color: "white", // Value label text color
                                    fontSize: "0.875rem", // Font size for value label
                                },
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">Größe</P>
                        <Slider
                            value={purchaseData.sides[currentSide].scale}
                            min={0.3}
                            max={3.5}
                            step={0.01}
                            onChange={handleScaleChange}
                            aria-labelledby="scale-slider"
                            sx={{
                                "& .MuiSlider-thumb": {
                                    backgroundColor: "#393836", // Customize the thumb color
                                    width: 20, // Thumb width
                                    height: 20, // Thumb height
                                    border: "2px solid white", // Add a border for visibility
                                    "&:hover, &.Mui-focusVisible": {
                                        boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)", // Add hover/focus effect
                                    },
                                },
                                "& .MuiSlider-track": {
                                    backgroundColor: "#B0D0D3", // Track color
                                    height: 6, // Track thickness
                                    border: "none",
                                },
                                "& .MuiSlider-rail": {
                                    backgroundColor: "#EBE0E1", // Rail color (default, unfilled area)
                                    height: 6, // Rail thickness
                                },
                                "& .MuiSlider-valueLabel": {
                                    backgroundColor: "#4f46e5", // Background color for value label
                                    color: "white", // Value label text color
                                    fontSize: "0.875rem", // Font size for value label
                                },
                            }}
                        />
                    </div>
                </>
            )}

            {/* Copy Front Design to Back */}
            {activeTab === 1 && !purchaseData.sides[currentSide].uploadedGraphicFile && (
                <FormControlLabel
                    control={<Checkbox checked={copyFrontToBack} onChange={handleCopyFrontToBack} color="primary" />}
                    label="Vorderseite auf Rückseite kopieren"
                    className="mt-8 !font-body"
                    sx={{
                        fontFamily: "Montserrat!important",
                    }}
                />
            )}
            {purchaseData.sides[currentSide].uploadedGraphicFile && (
                <div className="flex items-center gap-4 mt-4 font-body text-sm">
                    <img
                        className="max-h-24 rounded-[20px]"
                        src={URL.createObjectURL(purchaseData.sides[currentSide].uploadedGraphicFile)}
                        alt="Uploaded Preview"
                    />
                    <div className="flex flex-col gap-2">
                        <IconButton
                            onClick={() => {
                                handleDeleteUpload({ purchaseData, setPurchaseData, currentSide }),
                                    setCopyFrontToBack(false);
                            }}
                            icon={FiX}
                            label="Löschen"
                            bgColor="bg-errorColor"
                            hoverColor="hover:bg-red-600"
                            textColor="text-white"
                        />
                        <IconButton
                            onClick={() => {
                                handleShowDetails({
                                    uploadedFile: purchaseData.sides[currentSide].uploadedGraphicFile,
                                    setModalOpen: setModalOpen,
                                });
                            }}
                            icon={FiInfo}
                            label="Details anzeigen"
                            bgColor="bg-infoColor"
                            hoverColor="hover:bg-primaryColor-600"
                            textColor="text-white"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
