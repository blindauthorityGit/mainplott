import React from "react";
import { motion } from "framer-motion"; // For animations
import useStore from "@/store/store"; // Import Zustand store
import { H4, P } from "@/components/typography";

export default function ChoiceCard({ icon: Icon, heading, description, configuratorValue }) {
    const { purchaseData, setPurchaseData } = useStore();

    // Determine if the current card is active
    const isActive = purchaseData.configurator === configuratorValue;

    const handleClick = () => {
        // Update Zustand store with the selected configuration
        setPurchaseData({ ...purchaseData, configurator: configuratorValue });
    };

    // Animation variants for the background
    const backgroundVariants = {
        hidden: { opacity: 0, scale: 0.8 }, // Initial state
        visible: { opacity: 1, scale: 1 }, // Active state
        exit: { opacity: 0, scale: 0.8 }, // Exit state
    };

    return (
        <div className="relative w-full flex-1 flex flex-col">
            {/* Background for offset effect */}
            <motion.div
                className="absolute w-full h-full -bottom-2 -right-2 rounded-lg bg-accentColor"
                style={{ zIndex: 0 }}
                variants={backgroundVariants}
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
                exit="exit"
                transition={{
                    duration: 0.3, // Smooth animation duration
                    ease: "easeInOut", // Easing function
                }}
            ></motion.div>

            {/* Main Content */}
            <motion.div
                className={`relative w-full h-full p-4 lg:p-8 rounded-lg border-2  flex flex-col justify-between ${
                    isActive ? "border-primaryColor" : "border-gray-300"
                } transition-all duration-200 cursor-pointer shadow hover:shadow-lg`}
                style={{ zIndex: 1 }}
                whileHover={{ y: isActive ? 0 : -4 }}
                onClick={handleClick}
            >
                {/* Icon */}
                <div className="flex justify-center items-center mb-4">
                    <Icon className="text-primaryColor w-12 h-12" />
                </div>

                {/* Heading */}
                <H4 klasse="text-base lg:text-xl font-bold text-textColor !text-center mb-2">{heading}</H4>

                {/* Description */}
                <P klasse="text-center text-xs font-body ">{description}</P>
            </motion.div>
        </div>
    );
}
