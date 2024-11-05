import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineClose } from "react-icons/md";
import useStore from "../../store/store";
import Overlay from "./overlay"; // Import the Overlay component

const Modal = () => {
    const { modalOpen, setModalOpen, modalContent, isFullHeightModal } = useStore();
    const modalRef = useRef();

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
        } else {
            document.body.style.overflow = "unset";
        }
    }, [modalOpen]);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            closeModal();
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const modalClassNames = `w-full h-full flex flex-col relative items-center justify-center transition-colors duration-500 lg:max-w-[98%] min-h-[90%] lg:h-auto 2xl:min-h-[66%] lg:max-w-[80%] 2xl:max-w-[70%] 2xl:min-h-[66svh] lg:max-h-full bg-white py-6 px-6 md:p-12 lg:p-12 xl:p-16 overflow-y-auto ${
        isFullHeightModal ? "!h-full" : ""
    }`;

    const modalVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0, transition: { duration: 0.1 } },
    };

    if (!modalOpen) return null;

    return (
        <AnimatePresence>
            {modalOpen && (
                <>
                    {/* Overlay Component */}
                    <Overlay onClose={closeModal} />

                    {/* Modal Component */}
                    <motion.div
                        onClick={handleClickOutside}
                        className="fixed z-[99] inset-0 flex items-center justify-center p-2 lg:z-50"
                    >
                        <motion.div
                            ref={modalRef}
                            className={modalClassNames}
                            style={{
                                maxHeight: "100vh",
                            }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <div
                                className="closer absolute top-2 right-2 text-xl lg:text-4xl cursor-pointer transition hover:opacity-50 z-50"
                                onClick={closeModal}
                            >
                                <MdOutlineClose />
                            </div>
                            {modalContent}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
