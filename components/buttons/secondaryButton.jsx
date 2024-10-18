import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const SecondaryButton = ({
    link,
    onClick,
    type = "button",
    disabled = false,
    klasse = "",
    aklass = "",
    offsetColor = "bg-gray-400",
    hoverOffsetColor = "bg-gray-600",
    children,
    icon,
    ...props
}) => {
    const buttonAnimation = {
        rest: { scale: 1 },
        hover: { scale: 1 },
    };

    const offsetAnimation = {
        rest: { y: 8, x: 8 },
        hover: { y: -6, x: -6 },
    };

    const underlineAnimation = {
        rest: { scaleX: 0, originX: 0 },
        hover: { scaleX: 1, originX: 0 },
    };

    const transition = { duration: 0.2, ease: "easeInOut" };

    // Conditional rendering: Link version vs. Non-Link version
    const ButtonContent = (
        <motion.div className="relative inline-block w-full lg:w-auto" initial="rest" whileHover="hover" animate="rest">
            {/* Offset Background Layer */}
            <motion.div
                className={`absolute inset-0 ${offsetColor} rounded-[10px] -z-10`}
                variants={offsetAnimation}
                transition={transition}
            ></motion.div>

            {/* Actual Button */}
            <motion.button
                onClick={onClick}
                type={type}
                disabled={disabled}
                variants={buttonAnimation}
                transition={transition}
                className={`${klasse} ${
                    disabled ? "opacity-30 cursor-not-allowed" : ""
                } relative font-body  border-2 border-textColor font-semibold 2xl:text-base tracking-widest z-20 flex items-center justify-center py-4 text-xs sm:text-base xl:text-sm 3xl:text-[1rem] sm:py-6 xl:py-4 2xl:py-[1.2rem] w-full lg:w-auto px-4 uppercase rounded-[10px] lg:min-w-[20rem]`}
                {...props}
            >
                <motion.span
                    className="flex items-center font-semibold relative"
                    transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}
                >
                    {icon ? <img className="mr-4" src={icon.src} alt="icon" /> : null} {children}
                    {/* Underline Animation */}
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-primaryColor"
                        variants={underlineAnimation}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                </motion.span>
            </motion.button>
        </motion.div>
    );

    // Render Link version or Non-Link version based on the `link` prop
    return link ? (
        <Link href={link} className={`${aklass}`} passHref>
            {ButtonContent}
        </Link>
    ) : (
        ButtonContent
    );
};

export default SecondaryButton;
