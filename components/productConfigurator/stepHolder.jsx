import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { useState, useEffect, useRef } from "react";
import StepIndicator from "./shared/stepIndicator";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";

export default function StepHolder({ children, steps, currentStep, setCurrentStep }) {
    const { purchaseData, setPurchaseData } = useStore();
    const [imageHeight, setImageHeight] = useState(null);
    const imageRef = useRef();
    const { selectedImage } = useStore();

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        console.log(purchaseData);
    };

    const handleNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        console.log(purchaseData);
    };

    // Animation variants for the image - simple fade in/out
    const fadeAnimationVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Animation variants for entry and exit animations of content
    const animationVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    };

    useEffect(() => {
        if (imageRef.current) {
            console.log(imageRef.current.clientHeight);
            setImageHeight(imageRef.current.clientHeight);
        }
    }, [selectedImage]);

    return (
        <div className="grid grid-cols-12 lg:px-24 gap-4 h-full">
            {/* Left - Product Image with fade in/out animation */}
            <div className="col-span-6 relative">
                {/* Wrapper to preserve height and prevent layout shifts */}
                <div
                    className="w-full flex items-center justify-center"
                    style={{ height: imageHeight ? `${imageHeight}px` : "auto" }}
                >
                    <AnimatePresence mode="wait">
                        {selectedImage && (
                            <motion.img
                                key={selectedImage} // Key helps AnimatePresence to track changes
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
                            variants={animationVariants}
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
                        Back
                    </StepButton>
                    <StepButton
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-textColor text-white rounded"
                        klasse="bg-textColor"
                        disabled={currentStep === steps.length - 1}
                    >
                        Next
                    </StepButton>
                </div>
            </div>
        </div>
    );
}
