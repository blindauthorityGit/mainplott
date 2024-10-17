import React, { useState, useRef, useEffect } from "react";

//COMPS
import { CoverImage } from "../../components/images";
import { BasicPortableText } from "../../components/content";
import { SecondaryButton } from "../../components/buttons";
//TYPO
import { H1, H2, P } from "../../components/typography";

// ANIMATION
import { motion, useInView } from "framer-motion";

//ASSETS
import IntroImg from "../../assets/test/introImg.jpg";

//FUNTIONS
import urlFor from "../../functions/urlFor";

const IntroText = ({ data, order }) => {
    return (
        <>
            <div className="grid grid-cols-12 px-4 lg:px-24 gap-3 lg:gap-6 lg:mt-10 items-center">
                <motion.div
                    className={`col-span-12 lg:col-span-6  ${order ? "lg:pl-20" : "lg:pr-20"}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <BasicPortableText value={data.richText}></BasicPortableText>
                    <div className="lg:h-16"></div>
                    {data.button && (
                        <SecondaryButton link="/about" offsetColor="bg-primaryColor-200">
                            mehr erfahren
                        </SecondaryButton>
                    )}
                </motion.div>
                <div className={`col-span-12 lg:col-span-6 ${order ? "order-first" : null}`}>
                    <div className="">
                        <motion.div
                            className=" h-auto z-10 relative "
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <CoverImage
                                src={urlFor(data.image).url()}
                                mobileSrc={urlFor(data.image).url()}
                                alt="Cover Background"
                                klasse={""}
                                // style={{ }}
                                className=" !aspect-[16/9] lg:!aspect-[4/3]"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IntroText;

// data-scroll data-scroll-speed="3"
