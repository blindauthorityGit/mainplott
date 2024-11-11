import React, { useState } from "react";
import { motion } from "framer-motion";

const IconButton = ({
    onClick,
    icon: Icon, // Accept icon as a prop, to be used as a component
    label = "Button", // Default label
    bgColor = "bg-gray-500", // Default background color
    hoverColor = "hover:bg-gray-700", // Default hover color
    textColor = "text-white", // Default text color
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center ${bgColor} ${textColor} rounded-full p-2 overflow-hidden`}
            initial="rest"
            animate={isHovered ? "hover" : "rest"}
        >
            {/* Icon */}
            <Icon className="text-xl" />

            {/* Expanding Container for Text */}
            <motion.div
                className="flex items-center ml-2"
                variants={{
                    rest: { width: 0, opacity: 0 },
                    hover: { width: "auto", opacity: 1 },
                }}
                transition={{ duration: 0.3 }}
                style={{ whiteSpace: "nowrap" }} // Prevents text from wrapping
            >
                <motion.span className="ml-2 text-sm font-semibold">{label}</motion.span>
            </motion.div>
        </motion.button>
    );
};

export default IconButton;
