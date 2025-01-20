import React, { useState, useEffect } from "react";

// Import Swiper core and required modules
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Components
import Slide from "./slide";
import { GeneralNavButton } from "../../components/buttons";

const HeroSwiper = ({ data }) => {
    const [swiper, setSwiper] = useState(null);

    // Function to navigate to the previous slide
    const goToPrevSlide = () => {
        if (swiper) {
            swiper.slidePrev();
        }
    };

    // Function to navigate to the next slide
    const goToNextSlide = () => {
        if (swiper) {
            swiper.slideNext();
        }
    };

    return (
        <div className="w-full h-full relative bg-accentColor items-center lg:h-[40%] lg:rounded-[20px] overflow-hidden">
            <Swiper
                modules={[Pagination, Navigation]}
                slidesPerView={1}
                loop
                // pagination={{ clickable: true, dynamicBullets: true }}
                onSwiper={setSwiper} // Save swiper instance
                className="h-full w-full"
            >
                {/* Custom Navigation Buttons */}
                <div className="absolute z-10 lg:left-8 scale-50 lg:scale-100 bottom-2 top-[50%] lg:top-[46%]">
                    <GeneralNavButton
                        width="38"
                        height="38"
                        direction="left"
                        onClick={goToPrevSlide} // Attach function
                    />
                </div>
                <div className="absolute z-10 lg:right-8 right-0 bottom-2   scale-50 lg:scale-100 top-[50%] lg:top-[46%]">
                    <GeneralNavButton
                        width="38"
                        height="38"
                        direction="right"
                        onClick={goToNextSlide} // Attach function
                    />
                </div>

                {/* Slides */}
                {data?.map((e, i) => (
                    <SwiperSlide key={`swipo${i}`} className="w-full h-full flex overflow-visible">
                        <Slide
                            headline={e.headline}
                            text={e.text}
                            image={e.image}
                            buttonText={e.buttonText}
                            buttonLink={e.buttonLink}
                            mobileImage={e.image}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroSwiper;
