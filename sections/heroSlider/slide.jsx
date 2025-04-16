import React from "react";
import { CoverImage } from "../../components/images";
import { H1, P } from "../../components/typography";
import { MainButton } from "../../components/buttons";
import urlFor from "../../functions/urlFor";
import { motion } from "framer-motion"; // Import Framer Motion

const Slide = ({ image, mobileImage, headline, text, buttonText, buttonLink }) => {
    // Function to color the last word of the headline
    const colorLastWord = (text) => {
        const words = text.split(" ");
        const lastWord = words.pop();
        return (
            <>
                {words.join(" ")} <span className="!text-primaryColor">{lastWord}</span>
            </>
        );
    };

    return (
        <div className="grid grid-cols-12  lg:px-56 relative items-center mt-[-1rem] lg:mt-[-0rem]">
            <div className="col-span-12 lg:col-span-6 text-center lg:text-left -mt-[3rem] z-30 px-6 lg:px-0 lg:mt-6">
                <H1>{colorLastWord(headline)}</H1>
                <P klasse="hidden lg:block">{text}</P>

                {/* Wrapped button inside Framer Motion */}
                <motion.div
                    whileTap={{ scale: 0.9, opacity: 0.8 }} // Scale effect on tap
                    transition={{ duration: 0.15, ease: "easeOut" }} // Smooth transition
                >
                    <MainButton
                        klasse="mb-6 lg:mb-0 !bg-textColor !font-medium !text-white border-2  font-bold border-textColor !text-textColor"
                        link={buttonLink}
                    >
                        {buttonText}
                    </MainButton>
                </motion.div>
            </div>
            <div className="col-span-12 lg:col-span-6 relative order-first lg:order-last scale-[0.75] lg:scale-[0.85]">
                <CoverImage
                    src={urlFor(image).url()}
                    mobileSrc={urlFor(mobileImage).url()}
                    mobileFit="contain"
                    alt="Cover Background"
                    klasse={"absolute "}
                    className="aspect-[2.8/3] lg:aspect-[3/3.25] lg:overflow-visible lg:mt-20 w-[66%] lg:w-full relative lg:static mx-auto"
                />
            </div>
        </div>
    );
};

export default Slide;
