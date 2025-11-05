// mobileStepNavigator.jsx
import React from "react";
import { motion } from "framer-motion";
import { StepButton } from "@/components/buttons";
import { BiChevronRight, BiShoppingBag } from "react-icons/bi";

const MobileStepNavigator = ({
    steps = [],
    currentStep = 0,
    handlePrevStep,
    handleNextStep,
    isNextDisabled,
    handleAddToCart,
    summaryStepName = "Zusammenfassung",
}) => {
    const total = steps.length || 1;
    const atSummary = steps[currentStep] === summaryStepName;

    // Progress-Breite robust berechnen (keine Division durch 0)
    const progress = total > 1 ? (currentStep / (total - 1)) * 100 : 100;

    // primary button disabled: bei Steps < Zusammenfassung -> nextDisabled()
    const primaryDisabled = atSummary ? false : !!isNextDisabled?.();

    const handlePrimary = () => {
        if (atSummary) {
            handleAddToCart?.();
        } else {
            handleNextStep?.();
        }
    };

    return (
        <div className="fixed bottom-0 left-0 lg:hidden right-0 w-full z-30 bg-primaryColor-200">
            {/* Progress bar */}
            <div className="h-2 w-full">
                <div className="relative w-full h-1 bg-gray-200 rounded-full">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-textColor rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Button row */}
            <div className="w-full bg-primaryColor-200 shadow-md p-4 flex justify-between items-center">
                <div className="text-sm font-bold text-textColor font-body">
                    {Math.min(currentStep + 1, total)} von {total}
                </div>

                <div className="flex items-center space-x-4 text-sm text-textColor">
                    <StepButton
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        klasse="px-4 py-2 text-textColor !text-xs border border-textColor rounded-md"
                    >
                        zurück
                    </StepButton>

                    <StepButton
                        onClick={handlePrimary}
                        disabled={primaryDisabled}
                        klasse={
                            atSummary
                                ? "px-4 py-2 !bg-successColor text-white !text-xs rounded-md"
                                : "px-4 py-2 text-white bg-textColor !text-xs rounded-md"
                        }
                    >
                        <span className="flex items-center justify-center">
                            {atSummary ? (
                                <>
                                    <BiShoppingBag className="mr-2 text-base" />
                                    Kaufen
                                </>
                            ) : (
                                <>
                                    Weiter
                                    <BiChevronRight className="ml-2 text-base" />
                                </>
                            )}
                        </span>
                    </StepButton>
                </div>
            </div>
        </div>
    );
};

export default MobileStepNavigator;
