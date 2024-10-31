import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineClose } from "react-icons/md";

const foldInAnimation = {
    initial: {
        opacity: 0,
        scale: 0.5,
        rotate: 45,
        x: "50vw",
        y: "-50vh",
    },
    animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        x: "-50%",
        y: "-50%",
        transition: {
            duration: 0.8,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.5,
        rotate: -45,
        x: "50vw",
        y: "-50vh",
        transition: {
            duration: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
};

const ModalMenu = ({ isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-container modalClass transition duration-500 grid grid-cols-12 gap-8 p-16 bg-primaryColor-100 fixed z-50 w-[100svw] min-h-[100svh] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    // variants={foldInAnimation}
                >
                    <div
                        className="closer absolute top-6 right-6 text-4xl cursor-pointer transition hover:opacity-50 z-50"
                        onClick={onClose}
                    >
                        <MdOutlineClose />
                    </div>
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalMenu;
