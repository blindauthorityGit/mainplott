import React from "react";
import { motion } from "framer-motion";
import { StepButton } from "@/components/buttons";

const MobileStepNavigator = ({
    steps,
    currentStep,
    setCurrentStep,
    handlePrevStep,
    handleNextStep,
    isNextDisabled,
}) => {
    return (
        <div className="fixed bottom-0 left-0 lg:hidden right-0 w-full z-50 bg-white">
            <div className="h-2 w-full">
                <div className="relative w-full h-1 bg-gray-200 rounded-full">
                    {/* Progress Line */}
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-textColor rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />

                    {/* Step Dots */}
                    {/* <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-4 h-4 rounded-full ${
                                    index <= currentStep ? "bg-textColor" : "bg-gray-300"
                                }`}
                            />
                        ))}
                    </div> */}
                </div>
            </div>
            <div className=" w-full bg-white shadow-md p-4 flex justify-between items-center ">
                {/* Current Step Indicator */}

                <div className="text-sm font-bold font-body">
                    Schritt {currentStep + 1} von {steps.length}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-4 text-sm">
                    <StepButton
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        klasse="px-4 py-2 text-textColor !text-xs border border-textColor rounded-md"
                    >
                        zurück
                    </StepButton>
                    <StepButton
                        onClick={handleNextStep}
                        disabled={isNextDisabled()}
                        klasse="px-4 py-2 text-white bg-textColor !text-xs rounded-md"
                    >
                        Weiter
                    </StepButton>
                </div>
            </div>
        </div>
    );
};

export default MobileStepNavigator;
