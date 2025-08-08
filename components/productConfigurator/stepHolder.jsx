import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { React, useState, useEffect, useRef, forwardRef, useMemo, useLayoutEffect } from "react";
import { BiRefresh, BiChevronLeft, BiChevronRight, BiShoppingBag } from "react-icons/bi"; // Import the rotate icon from react-icons
import StepIndicator from "./shared/stepIndicator";
import MobileStepNavigator from "./shared/mobileStepNavigator";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import RotateButton from "@/components/buttons/rotateButton";
import { exportCanvas } from "@/functions/exportCanvas";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

//Hooks
import useIsMobile from "@/hooks/isMobile";
import { useSwipeable } from "react-swipeable";

//FUNCTIONS
import { isNextDisabled, isPrevDisabled, handlePrevStep, handleNextStep } from "@/functions/stepHandlers";
import exportAllSides from "@/functions/exportAllSides";
import { calculateNetPrice } from "@/functions/calculateNetPrice"; // Import your net price function
import { saveCartItem, cacheCartBlob } from "@/functions/saveCartItem";
import { v4 as uuidv4 } from "uuid";
// Dynamically import the KonvaLayer component with no SSR
// Provide a fallback
const KonvaLayer = dynamic(() => import("@/components/konva"), {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-gray-50" />, // or a spinner
});
const MobileKonva = dynamic(() => import("@/components/konva/mobileKonva"), {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-gray-50" />, // or a spinner
});
// import KonvaLayer from "@/components/konva/konvaWrapper"; // Normal import
// import KonvaLayerWithRef from "@/components/konva/konvaWrapper"; // Adjust the path to your wrapper

export default function StepHolder({ children, steps, currentStep, setCurrentStep, veredelungen }) {
    const konvaLayerRef = useRef(null);

    const router = useRouter();
    const { handle, editIndex } = router.query;

    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,
        selectedImage,
        setSelectedVariant,
        setSelectedImage,
        cartItems,
        cacheBlob,
        blobCache,
        getCachedBlob,
        initializeCart,
        addToCart,
        openCartSidebar,
        addCartItem,
        updateCartItem,
        configuredImage,
        setConfiguredImage,
        stageRef,
        transformerRef,
        boundaryPathRef,
        resetPurchaseData,
        isMobileSliderOpen,
        showMobileSteps,
        hideMobileSteps,
        revealMobileSteps,
    } = useStore();
    const [imageHeight, setImageHeight] = useState(null);
    const [imageSize, setImageSize] = useState({ width: null, height: null });
    const [isFrontView, setIsFrontView] = useState(purchaseData.currentSide === "front"); // Track if we're viewing the front or back
    const configStepIndex = steps.findIndex((step) => step === "Design"); // Dynamically find the config step
    const [isLoadingImage, setIsLoadingImage] = useState(false); // State to track loading
    const [isExporting, setIsExporting] = useState(false); // Track exporting state

    const imageRef = useRef();
    const containerRef = useRef(); // Add a reference to the container
    const isMobile = useIsMobile();

    const exportCanvasRef = useRef(null);
    const optionenIndex = steps.findIndex((s) => s === "Optionen"); // or whatever your step is called

    const isEditing = editIndex != null;
    const existingItem = isEditing ? cartItems[parseInt(editIndex, 10)] : null;
    const existingItemId = existingItem?.id;

    // our extracted handler
    function handleSave() {
        saveCartItem({
            purchaseData,
            veredelungen,
            selectedVariant,
            addCartItem,
            updateCartItem,
            openCartSidebar,
            hideMobileSteps,
            isEditing,
            existingItemId,
        });
    }

    const replace = useStore.setState;
    const [hydrated, setHydrated] = useState(false);

    // 1) initialize cart once when router is ready
    useEffect(() => {
        console.log("🚀 Hydrate attempt:", {
            ready: router.isReady,
            editing: isEditing,
            cartLen: cartItems.length,
            editIndex,
            cartItems,
        });

        if (!router.isReady || !isEditing) return;
        console.log("CARTITMS", cartItems);

        const item = cartItems[Number(editIndex)];
        if (!item) return;

        useStore.setState({ purchaseData: item, selectedVariant: item.selectedVariant });
        console.log("✔ after setState, store is now:", useStore.getState().purchaseData);

        console.log("💧 Hydrated purchaseData:", useStore.getState().purchaseData);

        /** 2️⃣ Blobs cachen – darf gern bleiben */
        ["front", "back"].forEach((side) => {
            const key = `${item.id}:${side}`;
            const file = getCachedBlob(key);
            console.log("cached blob for", key, file);
        });
        console.log("FULL BLOB CACHE:", useStore.getState().blobCache);

        console.log("SELCTED VARIANT", selectedVariant);

        /** 3️⃣ Rest wieder wie gehabt */
        setSelectedImage(item.selectedImage);
        setCurrentStep(optionenIndex);
        setHydrated(true);
    }, [router.isReady, isEditing, cartItems, editIndex]);

    // useEffect(() => {
    //     console.log("PÖRTSCHESE", purchaseData);
    // }, [purchaseData]);

    // Reset state when the URL changes
    // useEffect(() => {
    //     // if we have both a handle and an editIndex, try to load that cartItem
    //     if (handle != null && editIndex != null) {
    //         const idx = parseInt(editIndex, 10);
    //         const item = cartItems[idx];
    //         console.log("the important item", item);
    //         if (item && item.product?.handle === handle) {
    //             // hydrate everything in one go
    //             setPurchaseData(item);
    //             setSelectedImage(item.selectedImage || null);
    //             setCurrentStep(optionenIndex);

    //             // leave currentStep at 0 so you start at step 1,
    //             // but since all your data is already filled out,
    //             // none of your validations will fire.
    //             return;
    //         }
    //     }
    //     const blob = getCachedBlob(existingItemId);
    //     console.log("cached blob for", existingItemId, blob);

    //     // otherwise, brand-new config
    //     resetPurchaseData();
    //     setSelectedImage(null);
    //     setCurrentStep(0);
    // }, [handle, editIndex, existingItemId]);

    const handleExport = () => {
        if (exportCanvasRef.current) {
            exportCanvasRef.current();
        }
    };

    const handlePrevStep = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (currentStep == steps.length - 1 && purchaseData.tryout) {
            setCurrentStep(0);
        } else {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
        if (steps[currentStep] == "Design") {
            handleExport();
        }
        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0 });
        }
    };

    const handleNextStep = async () => {
        // If we are at the Design step, export both sides first
        window.scrollTo({ top: 0 });

        if (steps[currentStep] === "Design" && purchaseData.configurator !== "template") {
            setIsExporting(true);
            await exportAllSides({
                purchaseData,
                setPurchaseData,
                setConfiguredImage,
                exportCanvasRef,
            });
            setIsExporting(false);
        }

        // Now proceed to next step
        if (currentStep == 0 && purchaseData.tryout) {
            setCurrentStep(steps.length - 2);
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }

        if (isMobile) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
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

    // CHECK FOR COIRRECT PRODUCT IMAGE DEOPENSING IF CONFIG IS DONE OR NOT
    // In StepHolder.js

    // 1) Extract the front/back original images:
    // const frontOriginal = selectedVariant?.image?.originalSrc || null;
    // const backOriginal = selectedVariant?.backImageUrl || null;

    // // 2) Extract the front/back *exported* images:
    // const frontExported = purchaseData?.design?.front?.downloadURL || null;
    // const backExported = purchaseData?.design?.back?.downloadURL || null;

    // const isFront = purchaseData.currentSide === "front";

    // // If we are past the config step, not in template, and not a tryout...
    // const isPostDesign =
    //     currentStep > configStepIndex && purchaseData.configurator !== "template" && !purchaseData.tryout;

    // let displayedImage;
    // if (isPostDesign) {
    //     displayedImage = isFront ? frontExported || frontOriginal : backExported || backOriginal;
    // } else {
    //     // Otherwise show the original front/back
    //     displayedImage = isFront ? frontOriginal : backOriginal;
    // }

    const isFront = purchaseData.currentSide === "front";
    const isPostDesign =
        currentStep > configStepIndex && purchaseData.configurator !== "template" && !purchaseData.tryout;

    const displayedImage = useMemo(() => {
        if (!selectedVariant) return null;

        const frontOrig = selectedVariant.image?.originalSrc ?? null;
        const backOrig = selectedVariant.backImageUrl ?? null;
        const frontExp = purchaseData.design?.front?.downloadURL ?? null;
        const backExp = purchaseData.design?.back?.downloadURL ?? null;

        if (isPostDesign) {
            return isFront ? frontExp || frontOrig : backExp || backOrig;
        }
        return isFront ? frontOrig : backOrig;
    }, [selectedVariant, purchaseData.design, purchaseData.currentSide, currentStep, isPostDesign]);

    // SET VIEW TO FRONMT WHEN NAVIGATING
    // useEffect(() => {
    //
    //
    //
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
        if (!selectedVariant) return;
        setSelectedImage(
            purchaseData.currentSide !== "front" && selectedVariant.backImageUrl
                ? selectedVariant.backImageUrl
                : selectedVariant.image.originalSrc
        );
    }, [purchaseData.currentSide, selectedVariant]);

    // Handle rotate button click
    // Toggles between front/back in the store
    const handleRotateImage = () => {
        // Only do something if there actually is a backImageUrl
        if (selectedVariant?.backImageUrl) {
            setPurchaseData((prev) => ({
                ...prev,
                currentSide: prev.currentSide === "front" ? "back" : "front",
            }));
            console.log("ROTATET", purchaseData);
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
        // skip until we actually have a URL
        if (!selectedImage || !imageRef.current) return;

        const img = new Image();
        img.src = selectedImage;

        img.onload = () => {
            let { width, height } = img;
            const cw = containerRef.current?.offsetWidth ?? 0;
            const ch = containerRef.current?.offsetHeight ?? 0;

            const maxH = isMobile ? Infinity : 860;

            if (height > maxH) {
                const r = maxH / height;
                height = maxH;
                width *= r;
            }
            if (height < ch) {
                const r = ch / height;
                height = ch;
                width *= r;
            }
            if (width > cw) {
                const r = cw / width;
                width = cw;
                height *= r;
            }

            setImageSize({ width, height });
        };
    }, [selectedImage, isMobile]);

    // Determine if "Next" button should be disabled
    const isNextDisabled = () => {
        if (steps[currentStep] === "Konfigurator" && !purchaseData.configurator) return true;
        if (steps[currentStep] === "Layout" && !purchaseData.layoutServiceSelected) return true;

        if (steps[currentStep] === "Upload") {
            const front = purchaseData.sides?.front || {};
            const hasGraphics =
                (front.uploadedGraphics?.length || 0) > 0 ||
                !!front.uploadedGraphic || // falls noch alte Single-Property irgendwo gesetzt wird
                !!front.uploadedGraphicFile; // fallback
            const hasTexts = (front.texts?.length || 0) > 0;

            if (!hasGraphics && !hasTexts) return true; // ← jetzt auch Text gültig
        }

        if (currentStep === steps.length - 1) return true;
        return false;
    };

    useEffect(() => {
        const chatIcon = document.querySelector(".tawk-min-container");

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

    // StepHolder.js (excerpt)

    const handleAddToCart = () => {
        const updatedPurchaseData = { ...purchaseData };
        const { sides, variants } = updatedPurchaseData;

        // 1) Copy `variants` and remove "Standard"
        const updatedVariants = { ...variants };

        if (updatedVariants.Standard) {
            delete updatedVariants.Standard;
        }

        const totalQuantity = Object.values(updatedVariants).reduce((sum, variant) => sum + (variant.quantity || 0), 0);

        const sidesToProcess = ["front", "back"];
        sidesToProcess.forEach((sideKey) => {
            const side = sides?.[sideKey];

            if (side?.uploadedGraphic || side?.uploadedGraphicFile) {
                const veredelungDetail = veredelungen?.[sideKey];

                if (veredelungDetail) {
                    const matchedDiscount = veredelungDetail.preisReduktion.discounts.find(
                        (discount) =>
                            totalQuantity >= discount.minQuantity &&
                            (discount.maxQuantity === null || totalQuantity <= discount.maxQuantity)
                    );

                    if (matchedDiscount) {
                        const variantIndex = veredelungDetail.preisReduktion.discounts.indexOf(matchedDiscount);

                        const selectedVariant = veredelungDetail.variants.edges[variantIndex];

                        if (selectedVariant) {
                            updatedVariants[`${sideKey}Veredelung`] = {
                                id: selectedVariant.node.id,
                                size: null,
                                quantity: totalQuantity,
                                price: calculateNetPrice(parseFloat(matchedDiscount.price)),
                                title: `${veredelungDetail.title} ${
                                    sideKey.charAt(0).toUpperCase() + sideKey.slice(1)
                                }`,
                                currency: veredelungDetail.currency,
                            };
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
            }
        });

        updatedPurchaseData.variants = updatedVariants;

        addCartItem(updatedPurchaseData);
        openCartSidebar();
        hideMobileSteps();
    };

    useEffect(() => {
        // Example: whenever route changes or a new product is loaded, re-show steps
        // (You might do this in a different place, depending on your logic)
        return () => {
            revealMobileSteps();
        };
    }, [revealMobileSteps]);

    //     const resetPurchaseData   = useStore.getState().resetPurchaseData;
    //   const setSelectedVariant  = useStore.getState().setSelectedVariant

    useEffect(() => {
        return () => {
            // resets the whole purchaseData tree
            resetPurchaseData(); // (= your helper from the store)
            // clear the variant object so the next product starts fresh
            setSelectedVariant(null);
        };
    }, []); //  ← empty dep-array  ➜ runs only on unmount

    if (isEditing && !hydrated) {
        return null; // oder <Spinner/>
    }

    return (
        <div className="grid grid-cols-12  lg:gap-4 h-full">
            {/* If exporting, show overlay */}
            {isExporting && (
                <div className="fixed inset-0 z-50 font-body flex items-center justify-center bg-black bg-opacity-70">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="text-white mt-4">Exporting... Bitte warten</p>
                    </div>
                </div>
            )}

            {/* Left - Product Image / Konva Layer with fade in/out animation */}
            <div className="col-span-12 lg:col-span-6 2xl:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center xl:min-h-[600px] 2xl:min-h-[800px] lg:max-h-[760px] relative">
                    <AnimatePresence mode="wait">
                        {steps[currentStep] === "Design" && purchaseData.configurator !== "template" ? (
                            <div
                                key="konva"
                                variants={fadeAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{
                                    display: isMobile && purchaseData.configurator === "template" ? "none" : "block",
                                }}
                            >
                                {isMobile ? (
                                    <MobileKonva
                                        key={purchaseData.currentSide}
                                        onExportReady={(fn) => (exportCanvasRef.current = fn)}
                                        ref={konvaLayerRef}
                                        uploadedGraphicFile={
                                            purchaseData.sides[purchaseData.currentSide].uploadedGraphicFile
                                        }
                                        uploadedGraphicURL={
                                            purchaseData.sides[purchaseData.currentSide].uploadedGraphic?.downloadURL
                                        }
                                        isPDF={purchaseData.sides[purchaseData.currentSide].isPDF}
                                        pdfPreview={purchaseData.sides[purchaseData.currentSide].preview}
                                        productImage={selectedVariant?.configImage || selectedImage}
                                        boundaries={
                                            {
                                                /* ... */
                                            }
                                        }
                                        position={{
                                            x: purchaseData.sides[purchaseData.currentSide].xPosition,
                                            y: purchaseData.sides[purchaseData.currentSide].yPosition,
                                            rotation: purchaseData.sides[purchaseData.currentSide].rotation || 0,
                                        }}
                                        setPosition={(newPos, newRotation) =>
                                            setPurchaseData({
                                                ...purchaseData,
                                                sides: {
                                                    ...purchaseData.sides,
                                                    [purchaseData.currentSide]: {
                                                        ...purchaseData.sides[purchaseData.currentSide],
                                                        xPosition: newPos.x,
                                                        yPosition: newPos.y,
                                                        rotation: newRotation,
                                                    },
                                                },
                                            })
                                        }
                                        scale={purchaseData.sides[purchaseData.currentSide].scale}
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
                                ) : (
                                    <KonvaLayer
                                        key={purchaseData.currentSide}
                                        onExportReady={(fn) => (exportCanvasRef.current = fn)}
                                        ref={konvaLayerRef}
                                        uploadedGraphicFile={
                                            purchaseData.sides[purchaseData.currentSide].uploadedGraphicFile
                                        }
                                        uploadedGraphicURL={
                                            purchaseData.sides[purchaseData.currentSide].uploadedGraphic?.downloadURL
                                        }
                                        isPDF={purchaseData.sides[purchaseData.currentSide].isPDF}
                                        pdfPreview={purchaseData.sides[purchaseData.currentSide].preview}
                                        productImage={selectedVariant?.configImage || selectedImage}
                                        boundaries={
                                            {
                                                /* ... */
                                            }
                                        }
                                        position={{
                                            x: purchaseData.sides[purchaseData.currentSide].xPosition,
                                            y: purchaseData.sides[purchaseData.currentSide].yPosition,
                                            rotation: purchaseData.sides[purchaseData.currentSide].rotation || 0,
                                        }}
                                        // setPosition={(newPos, newRotation) =>
                                        //     setPurchaseData({
                                        //         ...purchaseData,
                                        //         sides: {
                                        //             ...purchaseData.sides,
                                        //             [purchaseData.currentSide]: {
                                        //                 ...purchaseData.sides[purchaseData.currentSide],
                                        //                 xPosition: newPos.x,
                                        //                 yPosition: newPos.y,
                                        //                 rotation: newRotation,
                                        //             },
                                        //         },
                                        //     })
                                        // }
                                        scale={purchaseData.sides[purchaseData.currentSide].scale}
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
                                )}
                            </div>
                        ) : (
                            displayedImage &&
                            (!isMobile ||
                                (steps[currentStep] !== "Konfigurator" &&
                                    steps[currentStep] !== "Upload" &&
                                    steps[currentStep] !== "Optionen" &&
                                    steps[currentStep] !== "Zusammenfassung")) && (
                                <motion.div
                                    className="relative mix-blend-multiply"
                                    key={displayedImage}
                                    ref={imageRef}
                                    style={{
                                        maxHeight: isMobile ? "auto" : "760px",
                                        width: isMobile ? "" : imageSize.width ? `${imageSize.width}px` : "auto",
                                        height: isMobile ? "" : imageSize.height ? `auto` : "auto",
                                        objectFit: "contain",
                                    }}
                                    variants={fadeAnimationVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <img
                                        src={displayedImage ?? ""}
                                        alt="Product Step Image"
                                        className="w-full mix-blend-multiply p-4 lg:max-h-[none]"
                                        onLoad={() => setImageHeight(imageRef.current?.clientHeight)}
                                    />
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                    {/* Refresh button moved outside of the motion.div */}
                    {selectedVariant?.backImageUrl && (!isMobile || currentStep === 0 || currentStep === 3) && (
                        <RotateButton currentStep={currentStep} handleRotateImage={handleRotateImage} />
                    )}
                </div>
            </div>

            {/* Right - Step Indicator, Dynamic Content, Buttons */}
            <div className="col-span-12 lg:col-span-6 2xl:col-span-6   flex flex-col h-full">
                {/* Step Indicator */}
                <div className="lg:mb-6">
                    <StepIndicator currentStep={currentStep} steps={steps} />

                    {showMobileSteps && (
                        <MobileStepNavigator
                            steps={steps}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            handlePrevStep={handlePrevStep}
                            handleNextStep={handleNextStep}
                            isNextDisabled={isNextDisabled}
                            handleAddToCart={handleAddToCart}
                        />
                    )}
                </div>

                {/* Dynamic Content with entry/exit animation */}
                <div
                    className="flex-grow mb-8 px-4 lg:px-0"
                    style={{ zIndex: steps[currentStep] === "Design" && isMobileSliderOpen ? "-1" : null }}
                >
                    <AnimatePresence mode="wait" layout initial={false}>
                        <motion.div
                            key={`${router.query.editIndex}-${purchaseData.id}`} // ← include editIndex here
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
                <div className="mt-auto hidden lg:flex gap-2 lg:gap-4 justify-end 2xl:justify-between">
                    <div className="w-1/2 lg:w-auto">
                        <StepButton
                            onClick={() => handlePrevStep(currentStep, steps, setCurrentStep, isMobile)}
                            disabled={isPrevDisabled(currentStep)}
                            klasse="bg-textColor"
                            // Ensure button fills its container on mobile
                            className="w-full"
                        >
                            <BiChevronLeft className="inline-block mr-2 text-lg" />
                            zurück
                        </StepButton>
                    </div>
                    <div className="w-1/2 lg:w-auto">
                        {steps[currentStep] === "Zusammenfassung" ? (
                            <StepButton
                                onClick={handleSave}
                                klasse="!bg-successColor"
                                className="px-4 py-2 text-white rounded w-full"
                            >
                                {isEditing ? (
                                    <>
                                        <BiRefresh className="inline-block mr-2 text-lg" />
                                        Bestellung&nbsp;aktualisieren
                                    </>
                                ) : (
                                    <>
                                        <BiShoppingBag className="inline-block mr-2 text-lg" />
                                        In&nbsp;den&nbsp;Einkaufswagen
                                    </>
                                )}
                            </StepButton>
                        ) : (
                            <StepButton
                                onClick={() =>
                                    handleNextStep(
                                        currentStep,
                                        steps,
                                        setCurrentStep,
                                        purchaseData,
                                        isMobile,
                                        handleExport
                                    )
                                }
                                disabled={isNextDisabled(currentStep, steps, purchaseData)}
                                klasse="bg-textColor"
                                className="w-full"
                            >
                                Weiter
                                <BiChevronRight className="inline-block ml-2 text-lg" />
                            </StepButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
