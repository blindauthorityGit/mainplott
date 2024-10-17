import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer"; // To trigger animation when in view
import { H4, P } from "../typography";
import { CoverImage } from "../images";
import urlFor from "../../functions/urlFor";

const IconBox = ({ icon, headline, text, klasse = "" }) => {
    // Set up in-view animation hook
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    // Animation variant for scaling in
    const scaleAnimation = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
    };

    return (
        <motion.div
            ref={ref}
            className={`text-center ${klasse} px-4 py-8`}
            variants={scaleAnimation}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Icon */}
            <div className="mb-4 relative flex justify-center ">
                {icon && <img src={urlFor(icon).url()} alt="" className="h-24 w-auto lg:rounded-[20px]" />}
            </div>

            {/* Headline */}
            <H4 className="font-bold text-xl mb-2">{headline}</H4>

            {/* Paragraph */}
            <P klasse="text-textColor">{text}</P>
        </motion.div>
    );
};

export default IconBox;
