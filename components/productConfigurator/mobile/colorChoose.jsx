import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { getColorHex } from "@/libs/colors";
import { FaPalette } from "react-icons/fa"; // Palette icon

const MobileColorSelector = ({ colors, selectedColor, onColorChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleColorSelector = () => setIsOpen((prev) => !prev);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return createPortal(
        <div>
            {/* Floating Button */}
            <div className="absolute top-28 left-4  ">
                <button
                    onClick={toggleColorSelector}
                    className=" border-2 border-textColor bg-black text-white p-3 rounded-full z-50 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    aria-label="Choose Color"
                >
                    <FaPalette size={24} />
                </button>{" "}
                <span className="text-xs font-semibold font-body text-textColor">Farben</span>
            </div>
            {/* Color Selector Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        className="absolute top-[calc(72px+80px)] left-4 bg-white rounded-lg shadow-lg p-4 z-50 w-32"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        {/* <h4 className="font-body font-semibold text-base mb-3 text-center">Choose Color</h4> */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {colors.map((color, index) => (
                                <button
                                    key={`mobile-color-${index}`}
                                    className={`w-8 h-8 rounded-full border ${
                                        selectedColor === color.color ? "border-textColor border-2" : "border-textColor"
                                    } hover:scale-110 transition-transform`}
                                    style={{ backgroundColor: getColorHex(color.color) }}
                                    onClick={() => {
                                        onColorChange(color.color);
                                        setIsOpen(false); // Close after selection
                                    }}
                                    aria-label={`Select color ${color.color}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body // Render to the document body
    );
};

export default MobileColorSelector;
