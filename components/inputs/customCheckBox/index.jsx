import React from "react";
import { motion } from "framer-motion";

const CustomCheckbox = ({
    label,
    isChecked,
    onClick,
    children,
    activeClass = "bg-blue-500",
    nonActiveClass = "bg-white",
    offsetColor = "bg-gray-400",
    klasse,
    style,
    showTooltip = false, // Add a prop to control tooltip
    showLabel = true, // Add a prop to control tooltip
}) => {
    const offsetAnimation = {
        rest: { y: 0, x: 0 },
        active: { y: 4, x: 4 }, // Offset shift when active
    };

    const transition = { duration: 0.2, ease: "easeInOut" };

    return (
        <motion.div
            className={`relative ${klasse} border border-textColor inline-flex items-center justify-center lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 rounded-md cursor-pointer`}
            onClick={onClick}
            initial="rest"
            animate={isChecked ? "active" : "rest"}
            whileTap={{ scale: 0.95 }}
            // Conditionally add `title` attribute for the tooltip
            title={showTooltip ? label : ""}
        >
            {/* Main Checkbox Layer */}
            <motion.div
                className={`relative flex items-center justify-center w-full h-full rounded-md transition-colors duration-200 
                ${isChecked ? activeClass : nonActiveClass}`}
                style={isChecked ? null : style}
            >
                {children}
                <span className="text-xs 2xl:text-sm font-medium text-gray-700">{showLabel && label}</span>
            </motion.div>
            {/* Border on Activation */}
            {isChecked && (
                <motion.div
                    className="absolute"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            )}
            {/* Offset Background Layer */}
            {isChecked && (
                <motion.div
                    className={`absolute inset-0 ${offsetColor} rounded-[10px] -z-10`}
                    variants={offsetAnimation}
                    transition={transition}
                    style={style}
                />
            )}
        </motion.div>
    );
};

export default CustomCheckbox;
