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

const HeaderText = ({ data }) => {
    return (
        <>
            <div className="grid grid-cols-12 px-4 lg:px-24 gap-3 lg:gap-6 lg:mt-10 lg:mb-16 items-center">
                <motion.div
                    className={`col-span-12  text-center`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <P klasse="text-primaryColor font-bold ">{data?.topline}</P>
                    <H1>{data?.headline}</H1>
                    <div className="lg:w-2/4 mx-auto lg:mt-12">
                        <BasicPortableText value={data?.text}></BasicPortableText>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default HeaderText;

// data-scroll data-scroll-speed="3"
