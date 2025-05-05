import React, { useState } from "react";
// Swiper core + required modules
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Slide from "./slide";
import { GeneralNavButton } from "../../components/buttons";
import useStore from "@/store/store"; // ← your zustand store
import { LightBox } from "@/components/modalContent";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PortfolioSlider = ({ data }) => {
    const [swiper, setSwiper] = useState(null);

    const setModalOpen = useStore((s) => s.setModalOpen);
    const setModalContent = useStore((s) => s.setModalContent);

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

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (idx) => {
        console.log("CLICKED");
        setModalContent(<LightBox data={data} initialIndex={idx} />);
        setModalOpen(true);
    };

    return (
        <div className="w-full relative h-full">
            <Swiper
                modules={[Navigation, Pagination, A11y]}
                loop
                autoHeight
                onSwiper={setSwiper}
                className="w-full"
                centeredSlides={true}
                // default for the smallest screens
                slidesPerView={1.3}
                spaceBetween={4}
                // override at different breakpoints
                breakpoints={{
                    // when window ≥ 640px
                    640: {
                        slidesPerView: 1.5,
                        spaceBetween: 10,
                        centeredSlides: false,
                    },
                    // when window ≥ 768px
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 12,
                    },
                    // when window ≥ 1024pxa
                    1024: {
                        slidesPerView: 3.3,
                        spaceBetween: 16,
                    },
                }}
            >
                {data.map((e, idx) => (
                    <SwiperSlide key={idx} className="w-full h-full flex items-center overflow-visible">
                        <Slide
                            onClick={() => openLightbox(idx)}
                            headline={e.headline}
                            text={e.text}
                            image={e.image}
                            mobileImage={e.image}
                        />
                    </SwiperSlide>
                ))}
                {/* Custom Navigation Buttons */}
            </Swiper>
            <div className="absolute hidden lg:block z-10 -left-2 lg:-left-16 scale-50 lg:scale-100 bottom-2 top-[30%] lg:top-[46%]">
                <GeneralNavButton
                    width="38"
                    height="38"
                    direction="left"
                    onClick={goToPrevSlide} // Attach function
                />
            </div>
            <div className="absolute hidden lg:block z-10 lg:-right-16 -right-2 bottom-2   scale-50 lg:scale-100 top-[30%] lg:top-[46%]">
                <GeneralNavButton
                    width="38"
                    height="38"
                    direction="right"
                    onClick={goToNextSlide} // Attach function
                />
            </div>

            {lightboxOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-5 right-5 text-white text-3xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                    >
                        &times;
                    </button>

                    {/* Prev */}
                    <button
                        className="absolute left-5 text-white text-4xl"
                        onClick={showPrev}
                        disabled={currentIndex === 0}
                    >
                        ‹
                    </button>

                    {/* The large image */}
                    <img
                        src={data[currentIndex].image}
                        alt={data[currentIndex].label}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next */}
                    <button
                        className="absolute right-5 text-white text-4xl"
                        onClick={showNext}
                        disabled={currentIndex === data.length - 1}
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioSlider;
