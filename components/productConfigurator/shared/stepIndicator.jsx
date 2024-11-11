import React from "react";
import { motion } from "framer-motion";
import useIsMobile from "@/hooks/isMobile"; // Import the mobile detection hook

const StepIndicator = ({ steps, currentStep }) => {
    const isMobile = useIsMobile(); // Detect if the device is mobile

    if (isMobile) {
        // Mobile view: Fixed bar at the bottom with a more minimal UI
        return (
            <div className="fixed font-body bottom-0 left-0 right-0 w-full bg-white shadow-md p-2 flex justify-between items-center">
                <div className="text-sm font-bold">
                    Step {currentStep + 1} of {steps.length}
                </div>
                <div className="flex items-center space-x-2">
                    <motion.div
                        className="w-8 h-8 rounded-full bg-textColor flex items-center justify-center text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep + 1}
                    </motion.div>
                    <div className="text-xs text-gray-600">{steps[currentStep]}</div>
                </div>
            </div>
        );
    }

    // Desktop and larger view: Original UI
    return (
        <div className="w-full flex flex-col items-center font-body">
            {/* Step Labels */}
            <div className="flex justify-between w-full mb-4">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`text-sm font-medium ${
                            index === currentStep ? "text-black" : "text-gray-400 opacity-50"
                        }`}
                    >
                        {step}
                    </div>
                ))}
            </div>

            {/* Step Line */}
            <div className="relative w-full h-1 bg-gray-200 rounded-full">
                {/* Progress Line */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-textColor rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {/* Step Dots */}
                <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-4 h-4 rounded-full ${index <= currentStep ? "bg-textColor" : "bg-gray-300"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
