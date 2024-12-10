import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { React, useState, useEffect, useRef, forwardRef } from "react";
import { BiRefresh } from "react-icons/bi"; // Import the rotate icon from react-icons
import StepIndicator from "./shared/stepIndicator";
import MobileStepNavigator from "./shared/mobileStepNavigator";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import { exportCanvas } from "@/functions/exportCanvas";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

//Hooks
import useIsMobile from "@/hooks/isMobile";
import { useSwipeable } from "react-swipeable";

//FUNCTIONS
import { isNextDisabled, isPrevDisabled, handlePrevStep, handleNextStep } from "@/functions/stepHandlers";

// Dynamically import the KonvaLayer component with no SSR
const KonvaLayer = dynamic(() => import("@/components/konva"), { ssr: false });
// import KonvaLayer from "@/components/konva/konvaWrapper"; // Normal import
// import KonvaLayerWithRef from "@/components/konva/konvaWrapper"; // Adjust the path to your wrapper

export default function StepHolder({ children, steps, currentStep, setCurrentStep, veredelungen }) {
    const konvaLayerRef = useRef(null);

    console.log(veredelungen);

    const router = useRouter();
    const { handle } = router.query;

    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,
        selectedImage,
        setSelectedImage,
        cartItems,
        addToCart,
        openCartSidebar,
        addCartItem,
        configuredImage,
        stageRef,
        transformerRef,
        boundaryPathRef,
        resetPurchaseData,
    } = useStore();
    const [imageHeight, setImageHeight] = useState(null);
    const [imageSize, setImageSize] = useState({ width: null, height: null });
    const [isFrontView, setIsFrontView] = useState(true); // Track if we're viewing the front or back
    const configStepIndex = steps.findIndex((step) => step === "Design"); // Dynamically find the config step
    const [isLoadingImage, setIsLoadingImage] = useState(false); // State to track loading

    const imageRef = useRef();
    const containerRef = useRef(); // Add a reference to the container
    const isMobile = useIsMobile();

    const exportCanvasRef = useRef(null);

    const [resetKonvaZoom, setResetKonvaZoom] = useState(null); // Store the reset function

    // Reset state when the URL changes
    useEffect(() => {
        if (handle) {
            console.log("URL changed, resetting data...");
            console.log("PÖRTSCHI", purchaseData);
            setCurrentStep(0);
            resetPurchaseData(); // Clear previous product state
            setSelectedImage(null); // Reset the image to prevent old data
            // setPurchaseData({
            //     ...purchaseData,
            //     currentSide: "front", // Default to front view
            //     product: null, // Ensure product-specific data resets
            // });
        }
    }, [handle]);

    const handleExport = () => {
        if (exportCanvasRef.current) {
            exportCanvasRef.current();
        }
    };

    const handlePrevStep = () => {
        if (currentStep == steps.length - 1 && purchaseData.tryout) {
            setCurrentStep(0);
        } else {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNextStep = () => {
        if (currentStep == 0 && purchaseData.tryout) {
            setCurrentStep(steps.length - 1);
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
        if (steps[currentStep] == "Design") {
            handleExport();
        }
        if (steps[currentStep] === "Design" && resetKonvaZoom) {
            resetKonvaZoom(); // Trigger reset
        }

        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        console.log(purchaseData);
    };

    // Swipe handlers with checks for enabled state
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (!isNextDisabled(currentStep, steps, purchaseData) && steps[currentStep] !== "Design") {
                handleNextStep({
                    currentStep,
                    steps,
                    setCurrentStep,
                    purchaseData,
                    isMobile,
                    handleExport,
                });
            }
        },
        onSwipedRight: () => {
            if (!isPrevDisabled(currentStep) && steps[currentStep] !== "Design") {
                handlePrevStep({
                    currentStep,
                    steps,
                    setCurrentStep,
                    isMobile,
                });
            }
        },
        trackTouch: true,
        preventDefaultTouchmoveEvent: true,
    });

    // Set the container dimensions in Zustand when the image is being displayed
    useEffect(() => {
        if (containerRef.current && (currentStep === 0 || currentStep === 1)) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            setPurchaseData({
                ...purchaseData,
                containerWidth: offsetWidth,
                containerHeight: offsetHeight,
            });
        }
    }, [currentStep]);

    //CHECK FOR COIRRECT PRODUCT IMAGE DEOPENSING IF CONFIG IS DONE OR NOT
    const displayedImage = currentStep > configStepIndex && !purchaseData.tryout ? configuredImage : selectedImage; // Show configuredImage if past the config step, else selectedImage

    // SET VIEW TO FRONMT WHEN NAVIGATING
    // useEffect(() => {
    //     console.log(steps[currentStep]);
    //     console.log(configStepIndex);
    //     console.log(stageRef);
    // }, [steps, currentStep]);

    useEffect(() => {
        if (!purchaseData.position && containerRef.current) {
            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides,
                    [purchaseData.currentSide]: {
                        ...purchaseData.sides[purchaseData.currentSide],
                        xPosition: containerRef.current.offsetWidth / 2,
                        yPosition: containerRef.current.offsetHeight / 2,
                    },
                },
            });
        }
    }, [containerRef.current]);

    useEffect(() => {
        if (selectedVariant && selectedVariant.image) {
            setSelectedImage(
                purchaseData.currentSide !== "front" && selectedVariant.backImageUrl
                    ? selectedVariant.backImageUrl
                    : selectedVariant.image.originalSrc
            );
        }
    }, [purchaseData.currentSide, selectedVariant]);

    // Handle rotate button click
    const handleRotateImage = () => {
        if (selectedVariant?.backImageUrl) {
            setIsFrontView(!isFrontView);
            setSelectedImage(isFrontView ? selectedVariant.backImageUrl : selectedVariant.image.originalSrc);
        }
    };

    // Animation variants for the image - simple fade in/out
    const fadeAnimationVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Adjust image dimensions dynamically to maintain aspect ratio and fill the container up to 860px height
    useEffect(() => {
        if (imageRef.current) {
            const img = new Image();
            img.src = selectedImage;
            img.onload = () => {
                let { width, height } = img;
                const containerWidth = containerRef.current?.offsetWidth;
                const containerHeight = containerRef.current?.offsetHeight;
                console.log(containerRef.current);
                // Set a max height limit (lower for mobile)
                const maxHeight = isMobile ? "auto" : 860;

                // Calculate aspect ratio
                const aspectRatio = width / height;

                // Adjust the image to fit within the container and respect the max height
                let finalWidth = containerWidth;
                let finalHeight = containerHeight;

                if (height > maxHeight) {
                    const ratio = maxHeight / height;
                    height = maxHeight;
                    width = width * ratio;
                }

                // If the height exceeds the container height, adjust the width accordingly
                if (height < containerHeight) {
                    const scaleFactor = containerHeight / height;
                    height = containerHeight;
                    width = width * scaleFactor;
                }

                // Ensure it respects the container dimensions
                if (width > containerWidth) {
                    const scaleFactor = containerWidth / width;
                    width = containerWidth;
                    height = height * scaleFactor;
                }

                // Set the image size
                setImageSize({ width, height });
            };
        }
    }, [selectedImage, isMobile]);

    // Determine if "Next" button should be disabled
    const isNextDisabled = () => {
        if (steps[currentStep] === "Konfigurator" && !purchaseData.configurator) {
            return true;
        }

        if (steps[currentStep] === "Upload" && !purchaseData.sides["front"].uploadedGraphic) {
            return true;
        }
        if (currentStep === steps.length - 1) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        const chatIcon = document.querySelector(".tawk-min-container");
        console.log(chatIcon);
        if (chatIcon) {
            // Initial behavior: hide the chat icon on mobile
            chatIcon.style.display = "none";
        }

        return () => {
            // Cleanup function: reset the display property on dismount
            if (chatIcon) {
                chatIcon.style.display = "block"; // Default back to 'block' on dismount
            }
        };
    }, [steps]);

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-4 h-full" {...swipeHandlers}>
            {/* Left - Product Image / Konva Layer with fade in/out animation */}
            <div className="col-span-12 lg:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center lg:min-h-[840px] lg:max-h-[860px] relative">
                    <AnimatePresence mode="wait">
                        {steps[currentStep] === "Design" ? (
                            <motion.div
                                key="konva"
                                variants={fadeAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <KonvaLayer
                                    onExportReady={(fn) => (exportCanvasRef.current = fn)}
                                    ref={konvaLayerRef}
                                    uploadedGraphicFile={
                                        purchaseData.sides[purchaseData.currentSide].uploadedGraphicFile
                                    }
                                    uploadedGraphicURL={
                                        purchaseData.sides[purchaseData.currentSide].uploadedGraphic?.downloadURL
                                    }
                                    resetHandler={setResetKonvaZoom} // Pass the state setter to store the reset function
                                    isPDF={purchaseData.sides[purchaseData.currentSide].isPDF}
                                    pdfPreview={purchaseData.sides[purchaseData.currentSide].preview}
                                    productImage={selectedImage}
                                    boundaries={
                                        {
                                            // MIN_X: 50,
                                            // MAX_X: 450,
                                            // MIN_Y: 50,
                                            // MAX_Y: 500,
                                        }
                                    }
                                    position={{
                                        x: purchaseData.sides[purchaseData.currentSide].xPosition,
                                        y: purchaseData.sides[purchaseData.currentSide].yPosition,
                                    }}
                                    setPosition={(newPos) =>
                                        setPurchaseData({
                                            ...purchaseData,
                                            sides: {
                                                ...purchaseData.sides,
                                                [purchaseData.currentSide]: {
                                                    ...purchaseData.sides[purchaseData.currentSide],
                                                    xPosition: newPos.x,
                                                    yPosition: newPos.y,
                                                },
                                            },
                                        })
                                    }
                                    scale={purchaseData.sides[purchaseData.currentSide].scale}
                                    // setScale={(newScale) => setPurchaseData({ ...purchaseData, scale: newScale })}
                                    setScale={(newScale) =>
                                        setPurchaseData({
                                            ...purchaseData,
                                            sides: {
                                                ...purchaseData.sides,
                                                [purchaseData.currentSide]: {
                                                    ...purchaseData.sides[purchaseData.currentSide],
                                                    scale: newScale,
                                                },
                                            },
                                        })
                                    }
                                />
                            </motion.div>
                        ) : (
                            displayedImage &&
                            (!isMobile ||
                                (steps[currentStep] !== "Konfigurator" && steps[currentStep] !== "Upload")) && (
                                <motion.div
                                    className="relative mix-blend-multiply"
                                    key={displayedImage}
                                    ref={imageRef}
                                    style={{
                                        maxHeight: isMobile ? "auto" : "860px",
                                        width: isMobile ? "" : imageSize.width ? `${imageSize.width}px` : "auto",
                                        height: isMobile ? "" : imageSize.height ? `auto` : "auto",
                                        // height: imageHeight ? `${imageHeight}px` : "auto", // Use imageHeight dynamically

                                        objectFit: "contain",
                                    }}
                                    variants={fadeAnimationVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <img
                                        src={displayedImage}
                                        alt="Product Step Image"
                                        className="w-full mix-blend-multiply max-h-[380px] lg:max-h-[none]"
                                        onLoad={() => setImageHeight(imageRef.current?.clientHeight)}
                                    />
                                    {/* Rotate Icon Button */}
                                    {selectedVariant?.backImageUrl && (
                                        <button
                                            onClick={handleRotateImage}
                                            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
                                        >
                                            <BiRefresh size={24} />
                                        </button>
                                    )}
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right - Step Indicator, Dynamic Content, Buttons */}
            <div className="col-span-12 lg:col-span-6 lg:pt-16 flex flex-col h-full">
                {/* Step Indicator */}
                <div className="lg:mb-6">
                    <StepIndicator currentStep={currentStep} steps={steps} />
                    <MobileStepNavigator
                        steps={steps}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        handlePrevStep={handlePrevStep}
                        handleNextStep={handleNextStep}
                        isNextDisabled={isNextDisabled}
                    ></MobileStepNavigator>
                </div>

                {/* Dynamic Content with entry/exit animation */}
                <div
                    className="flex-grow mb-8 px-4 lg:px-0"
                    style={{ zIndex: steps[currentStep] === "Design" && isMobile ? "-1" : null }}
                >
                    <AnimatePresence mode="wait" layout initial={false}>
                        <motion.div
                            layout
                            key={currentStep}
                            initial={{ opacity: 0, x: -10 }} // Slide from left for entry animation
                            animate={{ opacity: 1, x: 0 }} // Fade in and position to center
                            exit={{ opacity: 0, x: 10 }} // Slide out to the right for exit animation
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            // style={{ willChange: "auto" }}
                            // // Enable position layout animations
                            // layoutScroll // Keep layout changes from affecting scrollable/fixed elements
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons - Positioned at the bottom */}
                <div className="mt-auto lg:flex justify-between hidden ">
                    <StepButton
                        onClick={() => handlePrevStep(currentStep, steps, setCurrentStep, isMobile)}
                        disabled={isPrevDisabled(currentStep)}
                        klasse="bg-textColor"
                    >
                        zurück
                    </StepButton>
                    {steps[currentStep] === "Zusammenfassung" ? (
                        <StepButton
                            onClick={() => {
                                const updatedPurchaseData = { ...purchaseData };
                                const { sides, variants } = updatedPurchaseData;

                                const totalQuantity = Object.values(variants).reduce(
                                    (sum, variant) => sum + (variant.quantity || 0),
                                    0
                                );
                                console.log("Total Quantity:", totalQuantity);

                                const updatedVariants = { ...variants };
                                const sidesToProcess = ["front", "back"];

                                sidesToProcess.forEach((sideKey) => {
                                    const side = sides?.[sideKey];
                                    console.log(`Processing ${sideKey}:`, side);

                                    if (side?.uploadedGraphic || side?.uploadedGraphicFile) {
                                        const veredelungDetail = veredelungen?.[sideKey];
                                        console.log(`${sideKey} Veredelung Detail:`, veredelungDetail);

                                        if (veredelungDetail) {
                                            const matchedDiscount = veredelungDetail.preisReduktion.discounts.find(
                                                (discount) =>
                                                    totalQuantity >= discount.minQuantity &&
                                                    (discount.maxQuantity === null ||
                                                        totalQuantity <= discount.maxQuantity)
                                            );
                                            console.log(`${sideKey} Matched Discount:`, matchedDiscount);

                                            if (matchedDiscount) {
                                                const variantIndex =
                                                    veredelungDetail.preisReduktion.discounts.indexOf(matchedDiscount);
                                                console.log("variantIndex", variantIndex);
                                                const selectedVariant = veredelungDetail.variants.edges[variantIndex];
                                                console.log("vDetails", veredelungDetail.variants);
                                                console.log(`${sideKey} Selected Variant:`, selectedVariant);

                                                if (selectedVariant) {
                                                    updatedVariants[`${sideKey}Veredelung`] = {
                                                        id: selectedVariant.node.id,
                                                        size: null,
                                                        quantity: totalQuantity,
                                                        price: parseFloat(matchedDiscount.price),
                                                        title: `${veredelungDetail.title} ${
                                                            sideKey.charAt(0).toUpperCase() + sideKey.slice(1)
                                                        }`,
                                                        currency: veredelungDetail.currency,
                                                    };
                                                    console.log(
                                                        `Added ${sideKey}Veredelung:`,
                                                        updatedVariants[`${sideKey}Veredelung`]
                                                    );
                                                } else {
                                                    console.error(`No matching variant found for ${sideKey}.`);
                                                }
                                            } else {
                                                console.error(`No matching discount for ${sideKey}.`);
                                            }
                                        } else {
                                            console.error(`No veredelung detail found for side: ${sideKey}`);
                                        }
                                    } else {
                                        console.log(`No graphic for side: ${sideKey}, skipping.`);
                                    }
                                });

                                updatedPurchaseData.variants = updatedVariants;
                                console.log("Final Updated Variants:", updatedVariants);

                                addCartItem(updatedPurchaseData);
                                openCartSidebar();
                            }}
                            className="px-4 py-2 !bg-successColor text-white rounded"
                            klasse="!bg-successColor"
                        >
                            In den Einkaufswagen
                        </StepButton>
                    ) : (
                        <StepButton
                            onClick={() =>
                                handleNextStep(currentStep, steps, setCurrentStep, purchaseData, isMobile, handleExport)
                            }
                            disabled={isNextDisabled(currentStep, steps, purchaseData)}
                            klasse="bg-textColor"
                        >
                            Weiter
                        </StepButton>
                    )}
                </div>
            </div>
        </div>
    );
}
