// components/Slide.jsx

import React from "react";
import { CoverImage } from "../../components/images";
import urlFor from "../../functions/urlFor";
import { motion } from "framer-motion";

const Slide = ({
    image,
    mobileImage,
    onClick,
    label, // pass your image’s label/text here
}) => {
    return (
        <motion.div
            onClick={onClick}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="relative rounded-lg lg:rounded-3xl overflow-hidden cursor-pointer"
        >
            {/* SVG Border Animation */}
            <motion.svg
                className="absolute top-0 left-0 w-full h-full z-30"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M 5,5 H 95 V 95 H 5 Z"
                    fill="transparent"
                    stroke="#FFF"
                    strokeWidth="2"
                    variants={{
                        rest: { pathLength: 0 },
                        hover: { pathLength: 1 },
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </motion.svg>

            {/* Label Text in place of icon */}
            {label && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-40"
                    variants={{
                        rest: { scale: 0, opacity: 0 },
                        hover: { scale: 1, opacity: 1 },
                    }}
                    transition={{ delay: 0.3, duration: 0.3, ease: "easeInOut" }}
                >
                    <span className="text-white text-lg font-bold">{label}</span>
                </motion.div>
            )}

            {/* Image + Overlay */}
            <motion.div
                className="relative"
                variants={{
                    rest: { scale: 1, opacity: 1 },
                    hover: { scale: 1.05, opacity: 0.9 },
                }}
                transition={{ duration: 0.5 }}
            >
                {/* Colored Overlay */}
                <motion.div
                    className="absolute inset-0 bg-primaryColor opacity-20 z-20"
                    variants={{
                        rest: { opacity: 0.2 },
                        hover: { opacity: 0.6 },
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* Actual Cover Image */}
                <CoverImage
                    src={urlFor(image).url()}
                    mobileSrc={urlFor(mobileImage).url()}
                    mobileFit="contain"
                    alt={label || ""}
                    klasse="absolute rounded-3xl"
                    className="aspect-[4/3] lg:aspect-[2.8/3] w-[90%] lg:w-full mx-auto"
                    onClick={onClick}
                />
            </motion.div>
        </motion.div>
    );
};

export default Slide;
