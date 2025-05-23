import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const GhostButton = ({ link, onClick, type, disabled, klasse, aklass, children, ...props }) => {
    const buttonAnimation = {
        rest: { scale: 1 },
        hover: { scale: 1.05 },
    };

    const textAnimation = {
        rest: { scale: 1 },
        hover: { scale: 1.05 },
    };

    const transition = { duration: 0.1, ease: "easeInOut" };

    return (
        <Link href={link} className={`${aklass}`} passHref {...props}>
            <motion.button
                onClick={onClick}
                type={type}
                whileHover="hover"
                animate="rest"
                variants={buttonAnimation}
                transition={transition}
                disabled={disabled}
                className={`${klasse} ${
                    disabled ? "opacity-30" : null
                } font-body border border-darkGrey text-darkGrey font-regular 2xl:text-base tracking-widest hover-underline-animation z-20 flex items-center justify-center  py-4 text-xs sm:text-base xl:text-sm 3xl:text-[1rem] sm:py-6 xl:py-4 2xl:py-[1.2rem] w-full lg:w-auto px-6 uppercase rounded-[5px] lg:min-w-[20rem]`}
                // Spread additional props here
            >
                <motion.span variants={textAnimation} transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}>
                    {children}
                </motion.span>
            </motion.button>
        </Link>
    );
};

export default GhostButton;
