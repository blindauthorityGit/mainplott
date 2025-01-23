import React from "react";
import { motion } from "framer-motion";
import { Tooltip } from "@mui/material";

const IconButton = ({
    onClick,
    icon: Icon, // Accept icon as a prop
    label = "Button", // Default label for tooltip
    bgColor = "bg-gray-500", // Default background color
    hoverColor = "hover:bg-gray-700", // Default hover color
    textColor = "text-white", // Default text color
    tooltipPlacement = "top", // Tooltip placement
}) => {
    return (
        <Tooltip title={label} placement={tooltipPlacement} arrow>
            <motion.button
                type="button"
                onClick={onClick}
                className={`flex items-center justify-center ${bgColor} ${hoverColor} ${textColor} rounded-full p-3 shadow-md`}
                whileHover={{ scale: 1.1 }} // Hover animation
                whileTap={{ scale: 0.9 }} // Tap animation
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
                <Icon className="text-xl" />
            </motion.button>
        </Tooltip>
    );
};

export default IconButton;
