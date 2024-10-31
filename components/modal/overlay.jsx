import React from "react";
import { motion } from "framer-motion";

const Overlay = ({ onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }} // Ensure this matches the modal exit duration
        />
    );
};

export default Overlay;
