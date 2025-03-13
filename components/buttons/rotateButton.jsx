import { motion } from "framer-motion";
import { useState } from "react";
import { BiRefresh } from "react-icons/bi";

export default function RotateButton({ handleRotateImage }) {
    const [rotated, setRotated] = useState(false);

    const handleClick = () => {
        setRotated(!rotated);
        handleRotateImage();
    };

    return (
        <motion.button
            onClick={handleClick}
            animate={{ rotate: rotated ? 180 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 lg:right-16 bg-white p-2 text-textColor rounded-full shadow-md"
        >
            <BiRefresh size={28} />
        </motion.button>
    );
}
