// mobileStepNavigator.js
import React from "react";
import { motion } from "framer-motion";
import { StepButton } from "@/components/buttons";

const MobileStepNavigator = ({
    steps,
    currentStep,
    handlePrevStep,
    handleNextStep,
    isNextDisabled,
    handleAddToCart,
}) => {
    const currentStepName = steps[currentStep];
    const isLastStep = currentStepName === "Zusammenfassung";

    return (
        <div className="fixed bottom-0 left-0 lg:hidden right-0 w-full z-30 bg-primaryColor-200">
            {/* Progress bar */}
            <div className="h-2 w-full">
                <div className="relative w-full h-1 bg-gray-200 rounded-full">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-textColor rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${(currentStep / (steps.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Button row */}
            <div className="w-full bg-primaryColor-200 shadow-md p-4 flex justify-between items-center">
                <div className="text-sm font-bold font-body">
                    Schritt {currentStep + 1} von {steps.length}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <StepButton
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        klasse="px-4 py-2 text-textColor !text-xs border border-textColor rounded-md"
                    >
                        zurück
                    </StepButton>

                    {isLastStep ? (
                        <StepButton
                            onClick={handleAddToCart}
                            klasse="px-4 py-2 !bg-successColor text-white !text-xs rounded-md"
                        >
                            In den Einkaufswagen
                        </StepButton>
                    ) : (
                        <StepButton
                            onClick={handleNextStep}
                            disabled={isNextDisabled()}
                            klasse="px-4 py-2 text-white bg-textColor !text-xs rounded-md"
                        >
                            Weiter
                        </StepButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileStepNavigator;
