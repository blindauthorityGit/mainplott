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
}) => {
    const offsetAnimation = {
        rest: { y: 0, x: 0 },
        active: { y: 4, x: 4 }, // Offset-Verschiebung bei Aktivierung
    };

    const transition = { duration: 0.2, ease: "easeInOut" };

    return (
        <motion.div
            className={`relative ${klasse} border border-textColor inline-flex items-center justify-center w-10 h-10 rounded-md cursor-pointer `}
            onClick={onClick}
            initial="rest"
            animate={isChecked ? "active" : "rest"}
            whileTap={{ scale: 0.95 }}
        >
            {/* Haupt Checkbox Layer */}
            <motion.div
                className={`relative flex items-center justify-center w-full h-full rounded-md transition-colors duration-200 
                ${isChecked ? activeClass : nonActiveClass}`}
                style={isChecked ? null : style}
            >
                {children}
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </motion.div>
            {/* Umrandung bei Aktivierung */}
            {isChecked && (
                <motion.div
                    className="absolute  "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            )}{" "}
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
