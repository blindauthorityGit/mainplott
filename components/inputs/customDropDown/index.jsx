import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CustomDropdown = ({
    options,
    value,
    onChange,
    label,
    activeClass = "bg-blue-500",
    nonActiveClass = "bg-white",
    offsetColor = "bg-gray-400",
    klasse,
    style,
    showTooltip = false,
    showLabel = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative inline-block ${klasse}`}>
            {/* Main selection button */}
            <motion.div
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center justify-between cursor-pointer border border-textColor rounded-md px-4 py-2 ${nonActiveClass}`}
                style={style}
                whileTap={{ scale: 0.95 }}
                title={showTooltip ? label : ""}
            >
                <span className="text-sm">{value || (showLabel && label)}</span>
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </motion.div>

            {/* Dropdown options */}
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-1 z-10 border border-textColor rounded-md bg-white"
                    >
                        {options.map((option, index) => (
                            <li
                                key={index}
                                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                                    option === value ? activeClass : ""
                                }`}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
