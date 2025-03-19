import React, { useState, useEffect } from "react";
import { Slider, Tabs, Tab, Checkbox, FormControlLabel, Button } from "@mui/material";
import { P } from "@/components/typography";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { FiX, FiInfo, FiGitCommit, FiMaximize } from "react-icons/fi";
import { IconButton } from "@/components/buttons"; // Adjust import path as needed
import CustomRadioButton from "@/components/inputs/customRadioButton";
import VeredelungTable from "@/components/infoTable/veredlungsTable";

import generateVeredelungsPrice from "@/functions/generateVeredelungPrice";

// import { handleShowDetails, handleDeleteUpload } from "@/functions/fileHandlers";

// FUNCTIONS
import handleDeleteUpload from "@/functions/handleDeleteUpload";
import handleShowDetails from "@/functions/handleShowDetail";
import handleFileUpload from "@/functions/handleFileUpload";
import getImagePlacement from "@/functions/getImagePlacement";
import { centerVertically, centerHorizontally } from "@/functions/centerFunctions";
import resetScale from "@/functions/resetScale"; // Import the resetScale function
import useIsMobile from "@/hooks/isMobile";

export default function ConfigureDesign({ product, setCurrentStep, steps, currentStep, veredelungen }) {
    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,
        setModalOpen,
        setColorSpace,
        setModalContent,
        setDpi,
        setShowSpinner,
        isMobileSliderOpen,
    } = useStore();
    const [activeTab, setActiveTab] = useState(0); // Track which tab is active
    const [copyFrontToBack, setCopyFrontToBack] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const boundingRect = purchaseData.boundingRect; // { x, y, width, height }

    const currentSide = activeTab === 0 ? "front" : "back";

    const isMobile = useIsMobile();

    //fr radio buttons
    const [selectedValue, setSelectedValue] = useState(purchaseData.sides[currentSide]?.position || "");

    const containerWidth = purchaseData.containerWidth || 500; // Set a default value for safety
    const containerHeight = purchaseData.containerHeight || 500;

    console.log(selectedVariant);

    useEffect(() => {
        console.log(isMobileSliderOpen);
    }, [isMobileSliderOpen]);

    // Remove or conditionally include this useEffect
    useEffect(() => {
        // Only set currentSide if it’s not defined yet
        if (!purchaseData.currentSide) {
            setPurchaseData((prevData) => ({
                ...prevData,
                currentSide: "front",
            }));
        }
    }, []);

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

    const sideData = purchaseData.sides[currentSide] || {};
    let allowedMaxScale = 3.5; // fallback value
    if (
        purchaseData.boundingRect &&
        sideData.width &&
        sideData.height &&
        sideData.xPosition != null &&
        sideData.yPosition != null
    ) {
        allowedMaxScale = Math.min(
            (purchaseData.boundingRect.x + purchaseData.boundingRect.width - sideData.xPosition) / sideData.width,
            (purchaseData.boundingRect.y + purchaseData.boundingRect.height - sideData.yPosition) / sideData.height
        );
    }

    const handleScaleChange = (event, newValue) => {
        const sideData = purchaseData.sides[currentSide] || {};
        let allowedMaxScale = 3.5; // fallback
        if (
            boundingRect &&
            sideData.width &&
            sideData.height &&
            sideData.xPosition != null &&
            sideData.yPosition != null
        ) {
            allowedMaxScale = Math.min(
                (boundingRect.x + boundingRect.width - sideData.xPosition) / sideData.width,
                (boundingRect.y + boundingRect.height - sideData.yPosition) / sideData.height
            );
        }
        const clampedValue = Math.min(newValue, allowedMaxScale);
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    scale: clampedValue,
                },
            },
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPurchaseData((prevState) => ({
            ...prevState,
            currentSide: newValue === 0 ? "front" : "back",
        }));
    };

    const handleCopyFrontToBack = (event) => {
        const isChecked = event.target.checked;
        setCopyFrontToBack(isChecked);
        console.log(purchaseData);

        if (isChecked && purchaseData.sides.front.uploadedGraphic) {
            // Retrieve stored graphic dimensions and current scale from the front side
            const graphicWidth = purchaseData.sides.front.width || 0;
            const graphicHeight = purchaseData.sides.front.height || 0;
            const scale = purchaseData.sides.front.scale || 1;

            // Compute the displayed (scaled) dimensions
            const displayedWidth = graphicWidth * scale;
            const displayedHeight = graphicHeight * scale;

            // Compute centered positions so that the graphic's center aligns with the container's center
            const centeredX = (purchaseData.containerWidth - displayedWidth) / 2;
            const centeredY = (purchaseData.containerHeight - displayedHeight) / 2;

            // Copy front design to back, resetting rotation and using the centered positions
            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides, // Keep both front and back
                    back: {
                        ...purchaseData.sides.front, // Copy all front design properties to back
                        xPosition: centeredX,
                        yPosition: centeredY,
                        rotation: 0, // Reset rotation for the back side
                    },
                },
            });
        }
    };

    const handleGraphicUpload = async (event) => {
        console.log("UPLOADED");
        const newFile = event.target.files[0];

        const image = new Image();
        image.src = URL.createObjectURL(newFile);
        console.log(purchaseData.containerWidth, purchaseData.containerHeight);
        image.onload = () => {
            const imageWidth = image.width;
            const imageHeight = image.height;
            console.log(purchaseData.containerWidth, purchaseData.containerHeight, imageWidth, imageHeight);
            const { x, y } = getImagePlacement({
                containerWidth: purchaseData.containerWidth,
                containerHeight: purchaseData.containerHeight,
                imageNaturalWidth: image.width,
                imageNaturalHeight: image.height,
            });
            console.log("MEINE FUNCTION", x, y, currentSide);
            // Calculate centered position
            const centeredX = (purchaseData.containerWidth - imageWidth) / 2;
            const centeredY = (purchaseData.containerHeight - imageHeight) / 2;

            console.log("SPOSITIONE", centeredX, centeredY);

            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides,
                    [currentSide]: {
                        ...purchaseData.sides[currentSide],
                        xPosition: x,
                        yPosition: y,
                    },
                },
            });
        };

        if (newFile) {
            await handleFileUpload({
                newFile,
                currentSide,
                purchaseData,
                setUploadedFile,
                setPurchaseData,
                setModalOpen,
                setShowSpinner,
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
        title: purchaseData.configurator == "template" ? "Vorlage wählen" : "Platzierung",
        // description: "Passen Sie das Design auf dem Produkt an.",
    };

    // Parse and prioritize positions
    // Parse and prioritize positions
    const getPositions = () => {
        if (product?.fixedPositions?.value) {
            // Parse fixed positions and map them to the expected structure
            const fixed = JSON.parse(product.fixedPositions.value);

            // Front positions: Brust, Oberschenkel vorne, Vorne
            const frontPositions = fixed
                .filter(
                    (pos) =>
                        pos.includes("Brust") ||
                        pos.includes("Oberschenkel vorne") ||
                        pos.includes("Vorne") ||
                        pos.includes("Kugelschreiber") ||
                        pos.includes("Front")
                )
                .map((name) => ({
                    name,
                    enabled: true,
                    position: { x: 0.42, y: 0.42 },
                }));

            // Back positions: Rücken, Oberschenkel hinten, Hinten
            const backPositions = fixed
                .filter(
                    (pos) => pos.includes("Rücken") || pos.includes("Oberschenkel hinten") || pos.includes("Hinten")
                )
                .map((name) => ({
                    name,
                    enabled: true,
                    position: { x: 0.42, y: 0.42 },
                }));

            return {
                front: { default: frontPositions },
                back: { default: backPositions },
            };
        }

        // Default to templatePositions if no fixed positions exist
        return product?.templatePositions ? JSON.parse(product.templatePositions.value).properties : null;
    };

    const positions = getPositions();
    console.log("FIIIXED", positions);
    // At the top of your component, ensure purchaseData.sides exists
    useEffect(() => {
        if (!purchaseData.sides) {
            setPurchaseData((prev) => ({ ...prev, sides: { front: {} } }));
        }
    }, []);

    // In ConfigureDesign, right before the useEffect that sets the default position:
    const effectivePositions = positions || {
        front: { default: [{ name: "front", position: { x: 0.5, y: 0.5 } }] },
    };
    // If the current side isn’t defined in positions, default to "front"
    const effectiveSide = effectivePositions[currentSide] ? currentSide : "front";

    useEffect(() => {
        if (!purchaseData.sides[currentSide]?.position && positions[currentSide]?.default) {
            const defaultOption = positions[currentSide].default[0];
            console.log(defaultOption);
            setSelectedValue(defaultOption.name);

            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides,
                    [currentSide]: {
                        ...purchaseData.sides[currentSide],
                        position: defaultOption.name,
                        xPosition: purchaseData.containerWidth * defaultOption.position.x,
                        yPosition: purchaseData.containerHeight * defaultOption.position.y,
                    },
                },
            });
        }
    }, [currentSide, positions, purchaseData.containerWidth, purchaseData.containerHeight]);

    // Handle position change
    const handleChange = (value) => {
        setPurchaseData((prevData) => ({
            ...prevData,
            sides: {
                ...prevData.sides,
                [currentSide]: {
                    ...prevData.sides[currentSide],
                    position: value,
                },
            },
        }));
    };

    // Initialize default position for the current side
    useEffect(() => {
        const defaultOption = positions[currentSide]?.default?.[0];
        if (!purchaseData.sides[currentSide]?.position && defaultOption) {
            setPurchaseData((prevData) => ({
                ...prevData,
                sides: {
                    ...prevData.sides,
                    [currentSide]: {
                        ...prevData.sides[currentSide],
                        position: defaultOption.name,
                    },
                },
            }));
        }
    }, [currentSide, positions, setPurchaseData, purchaseData.sides]);

    useEffect(() => {
        setActiveTab(purchaseData.currentSide === "front" ? 0 : 1);
    }, [purchaseData.currentSide]);

    // useEffect(() => {
    //     // console.log(
    //     //     positions[currentSide].default,
    //     //     positions[currentSide].default[0].position.x,
    //     //     positions[currentSide].default[0].position.y
    //     // );
    //     if (purchaseData.configurator === "template") {
    //         setPurchaseData({
    //             ...purchaseData,
    //             sides: {
    //                 ...purchaseData.sides,
    //                 [currentSide]: {
    //                     ...purchaseData.sides[currentSide], // Preserve existing data for the current side
    //                     xPosition: purchaseData.containerWidth * positions[currentSide].default[0].position.x,
    //                     yPosition: purchaseData.containerHeight * positions[currentSide].default[0].position.y,
    //                 },
    //             },
    //         });
    //     }
    // }, [purchaseData.configurator]);

    let minX = 0;
    let maxX = purchaseData.containerWidth; // fallback
    let minY = 0;
    let maxY = purchaseData.containerHeight; // fallback

    if (boundingRect) {
        minX = boundingRect.x;
        maxX = boundingRect.x + boundingRect.width - 120;
        minY = boundingRect.y;
        maxY = boundingRect.y + boundingRect.height - 120;
    }

    return (
        <div className="flex flex-col lg:px-16 lg:mt-4 2xl:mt-8 font-body ">
            {/* Check for mobile Design, if true dont render it for UI reasons */}
            {steps[currentStep] === "Design" && isMobile ? null : <ContentWrapper data={stepData} showToggle />}

            {/* Material-UI Tabs Component */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="Product side tabs"
                centered={isMobile}
                className="mb-8 font-body text-xl !hidden lg:!flex"
                style={{ color: "#4f46e5", textAlign: "center" }} // Inline style to override default MUI color
                sx={{
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#ba979d", // Replace with your Tailwind primary color
                    },
                    "& .Mui-selected": {
                        color: "#393836!important", // Selected tab color
                        fontWeight: "bold", // Bold text for   centered={isMobile}the active tab
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
                {selectedVariant?.backImageUrl && (
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
                        backgroundColor: "#ba979d",
                        color: "white",
                        fontFamily: "Montserrat",
                        borderRadius: "8px",
                        "&:hover": {
                            backgroundColor: "primaryColor.light",
                        },
                        boxShadow: "none",
                    }}
                >
                    Datei hochladen
                    <input type="file" hidden onChange={handleGraphicUpload} />
                </Button>
            ) : purchaseData.configurator === "template" ? (
                <>
                    <div className="flex flex-wrap  lg:mb-4">
                        {positions[currentSide].default.map((option, index) => (
                            <CustomRadioButton
                                key={`radio${index}`}
                                id={option.name}
                                name="custom-radio-group"
                                label={option.name}
                                icon={option.icon}
                                value={option.name}
                                product={product}
                                checked={purchaseData.sides[currentSide]?.position === option.name}
                                onChange={() => handleChange(option.name, option.position.x, option.position.y)} // Pass additional parameters
                            />
                        ))}
                    </div>{" "}
                    {/* <div className="mb-4 mt-8">
                        <P klasse="!text-sm !mb-0">Größe</P>
                        <div className="flex space-x-4">
                            <Slider
                                value={purchaseData.sides[currentSide].scale}
                                min={0.3}
                                max={3.5}
                                step={0.01}
                                onChange={handleScaleChange}
                                aria-labelledby="scale-slider"
                                sx={{
                                    "& .MuiSlider-thumb": {
                                        backgroundColor: "#393836",
                                        width: 20,
                                        height: 20,
                                        border: "2px solid white",
                                        "&:hover, &.Mui-focusVisible": {
                                            boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)",
                                        },
                                    },
                                    "& .MuiSlider-track": {
                                        backgroundColor: "#e6d1d5",
                                        height: 6,
                                        border: "none",
                                    },
                                    "& .MuiSlider-rail": {
                                        backgroundColor: "#EBE0E1",
                                        height: 6,
                                    },
                                    "& .MuiSlider-valueLabel": {
                                        backgroundColor: "#4f46e5",
                                        color: "white",
                                        fontSize: "0.875rem",
                                    },
                                }}
                            />
                            <button
                                className=" bg-textColor text-white p-2 rounded-[10px]"
                                onClick={() => resetScale({ purchaseData, setPurchaseData, currentSide })}
                            >
                                <FiMaximize />
                            </button>{" "}
                        </div>
                    </div> */}
                </>
            ) : (
                <div className="hidden lg:block">
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">X-Achse Position</P>
                        <div className="flex space-x-4">
                            <Slider
                                value={purchaseData.sides[currentSide].xPosition}
                                min={minX}
                                max={maxX}
                                onChange={handleXChange}
                                aria-labelledby="x-axis-slider"
                                sx={{
                                    "& .MuiSlider-thumb": {
                                        backgroundColor: "#393836",
                                        width: 20,
                                        height: 20,
                                        border: "2px solid white",
                                        "&:hover, &.Mui-focusVisible": {
                                            boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)",
                                        },
                                    },
                                    "& .MuiSlider-track": {
                                        backgroundColor: "#e6d1d5",
                                        height: 6,
                                        border: "none",
                                    },
                                    "& .MuiSlider-rail": {
                                        backgroundColor: "#EBE0E1",
                                        height: 6,
                                    },
                                    "& .MuiSlider-valueLabel": {
                                        backgroundColor: "#4f46e5",
                                        color: "white",
                                        fontSize: "0.875rem",
                                    },
                                }}
                            />
                            <button
                                className=" bg-textColor text-white p-2 rounded-[10px]"
                                onClick={() => centerHorizontally({ purchaseData, setPurchaseData, currentSide })}
                            >
                                <FiGitCommit />
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">Y-Achse Position</P>
                        <div className="flex space-x-4">
                            <Slider
                                value={purchaseData.sides[currentSide].yPosition}
                                min={minY}
                                max={maxY}
                                onChange={handleYChange}
                                aria-labelledby="y-axis-slider"
                                sx={{
                                    "& .MuiSlider-thumb": {
                                        backgroundColor: "#393836",
                                        width: 20,
                                        height: 20,
                                        border: "2px solid white",
                                        "&:hover, &.Mui-focusVisible": {
                                            boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)",
                                        },
                                    },
                                    "& .MuiSlider-track": {
                                        backgroundColor: "#e6d1d5",
                                        height: 6,
                                        border: "none",
                                    },
                                    "& .MuiSlider-rail": {
                                        backgroundColor: "#EBE0E1",
                                        height: 6,
                                    },
                                    "& .MuiSlider-valueLabel": {
                                        backgroundColor: "#EBE0E1",
                                        color: "white",
                                        fontSize: "0.875rem",
                                    },
                                }}
                            />
                            <button
                                className="rotate-90 bg-textColor text-white p-2 rounded-[10px]"
                                onClick={() => centerVertically({ purchaseData, setPurchaseData, currentSide })}
                            >
                                <FiGitCommit />
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <P klasse="!text-sm !mb-0">Größe</P>
                        <div className="flex space-x-4">
                            <Slider
                                value={purchaseData.sides[currentSide].scale}
                                min={0.3}
                                max={allowedMaxScale} // computed above
                                step={0.01}
                                onChange={handleScaleChange}
                                aria-labelledby="scale-slider"
                                sx={{
                                    "& .MuiSlider-thumb": {
                                        backgroundColor: "#393836",
                                        width: 20,
                                        height: 20,
                                        border: "2px solid white",
                                        "&:hover, &.Mui-focusVisible": {
                                            boxShadow: "0px 0px 0px 8px rgba(79, 70, 229, 0.16)",
                                        },
                                    },
                                    "& .MuiSlider-track": {
                                        backgroundColor: "#e6d1d5",
                                        height: 6,
                                        border: "none",
                                    },
                                    "& .MuiSlider-rail": {
                                        backgroundColor: "#EBE0E1",
                                        height: 6,
                                    },
                                    "& .MuiSlider-valueLabel": {
                                        backgroundColor: "#4f46e5",
                                        color: "white",
                                        fontSize: "0.875rem",
                                    },
                                }}
                            />
                            <button
                                className=" bg-textColor text-white p-2 rounded-[10px]"
                                onClick={() => resetScale({ purchaseData, setPurchaseData, currentSide })}
                            >
                                <FiMaximize />
                            </button>{" "}
                        </div>
                    </div>
                </div>
            )}

            {/* Copy Front Design to Back */}
            {activeTab === 1 && !purchaseData.sides[currentSide].uploadedGraphicFile && (
                <FormControlLabel
                    control={<Checkbox checked={copyFrontToBack} onChange={handleCopyFrontToBack} color="primary" />}
                    label="Vorderseite auf Rückseite kopieren"
                    className="mt-8 font-body" // Use Tailwind CSS class
                    sx={{
                        "& .MuiTypography-root": {
                            fontFamily: "Montserrat, sans-serif", // Ensure Montserrat font is applied
                            fontWeight: "400", // Optional: Adjust font weight if needed
                        },
                    }}
                />
            )}

            {purchaseData.sides[currentSide].uploadedGraphicFile && (
                <div className="flex items-center space-x-4 flex-wrap justify-between">
                    <div className="info w-full lg:will-change-auto">
                        <VeredelungTable brustData={veredelungen.front} rueckenData={veredelungen.back} />
                    </div>
                    <div className="flex items-center gap-4 mt-4 font-body text-sm">
                        {purchaseData.sides[currentSide].isPDF ? (
                            <img
                                className="max-h-24 max-w-24 rounded-[20px]"
                                src={purchaseData.sides[currentSide].preview}
                                alt="Uploaded Preview"
                            />
                        ) : (
                            <img
                                className="max-h-24 max-w-36 rounded-[20px]"
                                src={URL.createObjectURL(purchaseData.sides[currentSide].uploadedGraphicFile)}
                                alt="Uploaded Preview"
                            />
                        )}

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
                </div>
            )}
        </div>
    );
}
