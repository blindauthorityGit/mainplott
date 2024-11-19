import React, { useState, useEffect } from "react";

import { CoverImage } from "@/components/images";
import urlFor from "@/functions/urlFor";

const BasicHero = ({ data }) => {
    const [swiper, setSwiper] = useState(null);
    const [isLastSlideLeft, setIsLastSlideLeft] = useState(true);
    const [isLastSlideRight, setIsLastSlideRight] = useState(false);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className="w-full grid grid-cols-12 bg-accentColor items-center  h-3/4 lg:h-[40%] lg:rounded-[20px]">
            <div
                className=" h-auto z-10 relative col-span-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <CoverImage
                    src={urlFor(data.heroImage).url()}
                    mobileSrc={urlFor(data.heroImage).url()}
                    alt="Cover Background"
                    klasse={""}
                    // style={{ }}
                    className=" !aspect-[16/9] lg:!aspect-[16/6]"
                />
            </div>
        </div>
    );
};

export default BasicHero;
