// components/MegaMenu.js
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CoverImage } from "../images"; // Importing your CoverImage component
import { H4 } from "../typography"; // Importing your H4 component
import urlFor from "../../functions/urlFor"; // Importing the URL function for images

const MegaMenu = ({ isVisible, data }) => {
    const containerVariants = {
        hidden: { opacity: 0, height: 0, scaleY: 0 },
        visible: { opacity: 1, height: "auto", scaleY: 1 },
        exit: { opacity: 0, height: 0, scaleY: 0 },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed left-0 right-0 mt-2 z-40 rounded-[20px] overflow-hidden origin-top"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <div className="container mx-auto p-6 bg-primaryColor-200 rounded-[20px]">
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
                        >
                            {data.menu.map((item, index) => (
                                <motion.div key={index} className="text-center p-4" variants={itemVariants}>
                                    <div className="mb-4 relative">
                                        <CoverImage
                                            src={urlFor(item.image).url()}
                                            alt={item.title}
                                            klasse="rounded-lg"
                                            className="h-40 w-full object-cover"
                                        />
                                    </div>
                                    <Link href={`/${item.title}`}>
                                        <H4 klasse="mb-4 font-bold">{item.title}</H4>
                                    </Link>
                                    <div className="text-left font-body">
                                        {item?.menuItems?.map((point, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex items-center mb-2 space-x-6"
                                                variants={itemVariants}
                                            >
                                                <img
                                                    src={urlFor(point.image).url()}
                                                    alt=""
                                                    className="h-6 w-6 fill-primaryColor-400"
                                                />
                                                <Link href={`/${point.link}`}>
                                                    <span>{point.text}</span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MegaMenu;
