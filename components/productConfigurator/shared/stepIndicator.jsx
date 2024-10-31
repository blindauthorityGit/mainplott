import React from "react";
import { motion } from "framer-motion";

const StepIndicator = ({ steps, currentStep }) => {
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
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
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
