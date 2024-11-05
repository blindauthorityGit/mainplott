import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { useState, useEffect, useRef } from "react";
import { BiRefresh } from "react-icons/bi"; // Import the rotate icon from react-icons
import StepIndicator from "./shared/stepIndicator";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import dynamic from "next/dynamic";

//Hooks
import useIsMobile from "@/hooks/isMobile";

// Dynamically import the KonvaLayer component with no SSR
const KonvaLayer = dynamic(() => import("@/components/konva"), { ssr: false });

export default function StepHolder({ children, steps, currentStep, setCurrentStep }) {
    const { purchaseData, setPurchaseData, selectedVariant, selectedImage, setSelectedImage } = useStore();
    const [imageHeight, setImageHeight] = useState(null);
    const [imageSize, setImageSize] = useState({ width: null, height: null });
    const [isFrontView, setIsFrontView] = useState(true); // Track if we're viewing the front or back

    const imageRef = useRef();
    const containerRef = useRef(); // Add a reference to the container
    const isMobile = useIsMobile();

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    // Set the container dimensions in Zustand when the image is being displayed
    useEffect(() => {
        if (containerRef.current && (currentStep === 0 || currentStep === 1)) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            setPurchaseData({
                ...purchaseData,
                containerWidth: offsetWidth,
                containerHeight: offsetHeight,
            });
            console.log(offsetWidth, offsetHeight);
        }
    }, [currentStep]);

    useEffect(() => {
        console.log(selectedVariant);
    }, [selectedVariant]);

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
    // Adjust image dimensions dynamically to maintain aspect ratio and fill the container up to 860px height
    useEffect(() => {
        if (imageRef.current) {
            const img = new Image();
            img.src = selectedImage;
            img.onload = () => {
                let { width, height } = img;
                const containerWidth = containerRef.current?.offsetWidth;
                const containerHeight = containerRef.current?.offsetHeight;

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
        if (currentStep === 1 && !purchaseData.uploadedGraphic) {
            return true;
        }
        if (currentStep === steps.length - 1) {
            return true;
        }
        return false;
    };

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-4 h-full">
            {/* Left - Product Image / Konva Layer with fade in/out animation */}
            <div className="col-span-12 lg:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center lg:min-h-[840px] lg:max-h-[860px] relative">
                    <AnimatePresence mode="wait">
                        {currentStep === 2 && purchaseData.uploadedGraphic ? (
                            <motion.div
                                key="konva"
                                variants={fadeAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <KonvaLayer
                                    uploadedGraphicFile={purchaseData.uploadedGraphicFile}
                                    uploadedGraphicURL={purchaseData.uploadedGraphic?.downloadURL}
                                    productImage={selectedImage}
                                    boundaries={{
                                        MIN_X: 50,
                                        MAX_X: 450,
                                        MIN_Y: 50,
                                        MAX_Y: 500,
                                    }}
                                    position={{ x: purchaseData.xPosition, y: purchaseData.yPosition }}
                                    setPosition={(newPos) =>
                                        setPurchaseData({ ...purchaseData, xPosition: newPos.x, yPosition: newPos.y })
                                    }
                                    scale={purchaseData.scale}
                                    setScale={(newScale) => setPurchaseData({ ...purchaseData, scale: newScale })}
                                />
                            </motion.div>
                        ) : (
                            selectedImage && (
                                <motion.div
                                    className="relative mix-blend-multiply"
                                    key={selectedImage}
                                    ref={imageRef}
                                    style={{
                                        maxHeight: isMobile ? "auto" : "860px",
                                        width: imageSize.width ? `${imageSize.width}px` : "auto",
                                        height: imageSize.height ? `${imageSize.height}px` : "auto",
                                        objectFit: "contain",
                                    }}
                                    variants={fadeAnimationVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <img
                                        src={selectedImage}
                                        alt="Product Step Image"
                                        className="w-full mix-blend-multiply"
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
                </div>

                {/* Dynamic Content with entry/exit animation */}
                <div className="flex-grow mb-8 px-4 lg:px-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons - Positioned at the bottom */}
                <div className="mt-auto flex justify-between">
                    <StepButton
                        onClick={handlePrevStep}
                        klasse="px-4 py-2 bg-textColor rounded"
                        disabled={currentStep === 0}
                    >
                        zurück
                    </StepButton>
                    <StepButton
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-textColor text-white rounded"
                        klasse="bg-textColor"
                        disabled={isNextDisabled()}
                    >
                        Weiter
                    </StepButton>
                </div>
            </div>
        </div>
    );
}
