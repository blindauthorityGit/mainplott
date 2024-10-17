import React, { useState, useEffect, useRef } from "react";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

//COMNPONENTS
import Slide from "./slide";
import { GeneralNavButton } from "../../components/buttons";

const HeroSwiper = ({ data }) => {
    const [swiper, setSwiper] = useState(null);
    const [isLastSlideLeft, setIsLastSlideLeft] = useState(true);
    const [isLastSlideRight, setIsLastSlideRight] = useState(false);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className="w-full grid grid-cols-12 bg-accentColor items-center  h-3/4 lg:h-[40%] lg:rounded-[20px]">
            <Swiper
                modules={[Pagination, Navigation]}
                slidesPerView={1}
                pagination={{ clickable: true, dynamicBullets: true }}
                onSwiper={(swiper) => {
                    {
                        setSwiper(swiper);
                    }
                }}
                navigation
                a11y // for accessibility
                onSlideChange={() => console.log("Slide changed")}
                className="h-full eventSlider col-span-12 !overflow-visible"
            >
                <div className="absolute z-10 bottom-8 hidden right-8 flex space-x-4">
                    <GeneralNavButton direction="left"></GeneralNavButton>
                    <GeneralNavButton></GeneralNavButton>
                </div>
                {data?.map((e, i) => (
                    <SwiperSlide key={`swipo${i}`} className="">
                        <Slide
                            headline={e.headline}
                            text={e.text}
                            image={e.image}
                            buttonText={e.buttonText}
                            buttonLink={e.buttonLink}
                            mobileImage={e.image}
                        ></Slide>{" "}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroSwiper;
