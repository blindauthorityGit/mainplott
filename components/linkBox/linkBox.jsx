import React from "react";
import { CoverImage } from "../images";
import { H3, P } from "../typography";
import Link from "next/link";
import urlFor from "../../functions/urlFor";
import { motion } from "framer-motion"; // Import framer-motion

const LinkBox = ({ klasse, link, image, text, icon, details, title }) => {
    return (
        <motion.div className={`${klasse} text-center`} initial="rest" whileHover="hover" animate="rest">
            <Link href={link}>
                {/* Container for image with overflow-hidden to avoid image overflow */}
                <div className="relative rounded-[10px] lg:rounded-[20px] overflow-hidden">
                    {/* SVG Border Animation */}
                    <motion.svg
                        className="absolute top-0 left-0 w-full h-full z-30"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M 5,5 H 95 V 95 H 5 Z" // Drawing a rectangle
                            fill="transparent"
                            stroke="#FFF" // Use your primary color or border color
                            strokeWidth="2"
                            variants={{
                                rest: { pathLength: 0 },
                                hover: { pathLength: 1 },
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </motion.svg>

                    {/* Icon Animation */}
                    {icon && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-40"
                            variants={{
                                rest: { scale: 0, opacity: 0 },
                                hover: { scale: 1, opacity: 1 },
                            }}
                            transition={{ delay: 0.3, duration: 0.3, ease: "easeInOut" }}
                        >
                            <img src={urlFor(icon).url()} alt="" />
                            {/* <Icon className="text-white text-6xl" /> */}
                        </motion.div>
                    )}

                    <motion.div
                        className="relative"
                        variants={{
                            rest: { scale: 1, opacity: 1 },
                            hover: { scale: 1.05, opacity: 0.9 },
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="bg-primaryColor w-full h-full opacity-20 absolute top-0 z-20 lg:rounded-[20px]"
                            variants={{
                                rest: { opacity: 0.2 },
                                hover: { opacity: 0.6 },
                            }}
                            transition={{ duration: 0.5 }}
                        ></motion.div>
                        <CoverImage
                            src={urlFor(image).url()}
                            mobileSrc={urlFor(image).url()}
                            alt="Cover Background"
                            klasse={"absolute lg:rounded-[20px]"}
                            className="aspect-[5/3] lg:aspect-[5/3] rounded-[10px] lg:rounded-[20px]"
                        />
                    </motion.div>
                </div>

                {/* Text with color animation */}
                <motion.div className="mt-2 relative inline-block">
                    <H3
                        klasse="relative !mb-4"
                        as={motion.h3}
                        variants={{
                            rest: { color: "#000" }, // Default color (e.g., dark grey or black)
                            hover: { color: "var(--primaryColor)" }, // Change to primary color
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        {text}
                    </H3>
                    {title && (
                        <H3
                            klasse="relative !mb-4"
                            as={motion.h3}
                            variants={{
                                rest: { color: "#000" }, // Default color (e.g., dark grey or black)
                                hover: { color: "var(--primaryColor)" }, // Change to primary color
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            {title}
                        </H3>
                    )}

                    {details && <P klasse="lg:!-mt-3">{details}</P>}
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default LinkBox;
