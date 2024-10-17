import React from "react";
import { CoverImage } from "../../components/images";
import { H1, H2, P } from "../../components/typography";
import { MainButton } from "../../components/buttons";

import urlFor from "../../functions/urlFor";

const Slide = ({ image, mobileImage, headline, text, buttonText, buttonLink, aspectRatio }) => {
    // Function to color the last word of the headline
    const colorLastWord = (text) => {
        const words = text.split(" ");
        const lastWord = words.pop();
        console.log(lastWord);
        return (
            <>
                {words.join(" ")} <span className="!text-primaryColor">{lastWord}</span>
            </>
        );
    };

    return (
        <div className="grid grid-cols-12 lg:px-56 relative  items-center mt-[-1rem] lg:mt-[-2rem]">
            <div className="col-span-12 lg:col-span-6 text-center lg:text-left -mt-[4rem] z-30 px-6 lg:px-0">
                <H1>{colorLastWord(headline)}</H1>
                <P klasse="hidden lg:block">{text}</P>

                <MainButton klasse="mb-6 lg:mb-0" link={buttonLink}>
                    {buttonText}
                </MainButton>
            </div>
            <div className="col-span-12 lg:col-span-6 relative order-first lg:order-last">
                <CoverImage
                    src={urlFor(image).url()}
                    mobileSrc={urlFor(mobileImage).url()}
                    alt="Cover Background"
                    klasse={"absolute "}
                    // style={{ }}
                    className="aspect-[2.8/3] lg:aspect-[3/3] lg:mt-20 w-[60%] lg:w-full relative lg:static mx-auto"
                />
            </div>
        </div>
    );
};

export default Slide;
