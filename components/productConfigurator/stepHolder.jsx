import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { useState, useEffect, useRef } from "react";
import StepIndicator from "./shared/stepIndicator";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import KonvaLayer from "@/components/konva"; // Importing the Konva Layer component

export default function StepHolder({ children, steps, currentStep, setCurrentStep }) {
    const { purchaseData } = useStore(); // Use purchaseData to determine if an uploadedGraphic exists
    const [imageHeight, setImageHeight] = useState(null);
    const imageRef = useRef();
    const { selectedImage } = useStore(); // Selected product image

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    // Animation variants for the image - simple fade in/out
    const fadeAnimationVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Set the image height to prevent layout shifts
    useEffect(() => {
        if (imageRef.current) {
            setImageHeight(imageRef.current.clientHeight);
        }
    }, [selectedImage]);

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
        <div className="grid grid-cols-12 lg:px-24 gap-4 h-full">
            {/* Left - Product Image / Konva Layer with fade in/out animation */}
            <div className="col-span-6 relative">
                <div
                    className="w-full flex items-center justify-center"
                    style={{ height: imageHeight ? `${imageHeight}px` : "auto" }}
                >
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
                                    uploadedGraphic={purchaseData.uploadedGraphic}
                                    productImage={selectedImage} // Assuming selectedImage is your front view for now
                                    boundaries={{
                                        MIN_X: 50,
                                        MAX_X: 450,
                                        MIN_Y: 50,
                                        MAX_Y: 500,
                                    }}
                                    position={{ x: 100, y: 100 }}
                                    setPosition={(newPos) =>
                                        setPurchaseData({ ...purchaseData, graphicPosition: newPos })
                                    }
                                    scale={1}
                                    setScale={(newScale) =>
                                        setPurchaseData({ ...purchaseData, graphicScale: newScale })
                                    }
                                />
                            </motion.div>
                        ) : (
                            selectedImage && (
                                <motion.img
                                    key={selectedImage}
                                    ref={imageRef}
                                    src={selectedImage}
                                    alt="Product Step Image"
                                    className="w-full h-auto mix-blend-multiply"
                                    variants={fadeAnimationVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    onLoad={() => setImageHeight(imageRef.current?.clientHeight)}
                                />
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right - Step Indicator, Dynamic Content, Buttons */}
            <div className="col-span-6 lg:pt-16 flex flex-col h-full">
                {/* Step Indicator */}
                <div className="mb-6">
                    <StepIndicator currentStep={currentStep} steps={steps} />
                </div>

                {/* Dynamic Content with entry/exit animation */}
                <div className="flex-grow mb-8">
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
