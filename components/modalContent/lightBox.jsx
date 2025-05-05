// components/LightBox.jsx
import React, { useState } from "react";
import { GeneralNavButton } from "../../components/buttons";
import urlFor from "@/functions/urlFor";

const LightBox = ({ data = [], initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const item = data[currentIndex];
    if (!item) return null;

    const goPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((i) => Math.max(0, i - 1));
    };
    const goNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((i) => Math.min(data.length - 1, i + 1));
    };

    return (
        <div className="relative flex flex-col lg:flex-row items-center justify-center p-6">
            {/* Prev Button */}
            <div className="absolute z-10 -left-2 lg:-left-16 scale-50 lg:scale-100 bottom-2 top-[30%] lg:top-[46%]">
                <GeneralNavButton
                    width="38"
                    height="38"
                    direction="left"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                />
            </div>

            {/* Image + Description */}
            <div className="flex-1 max-w-3xl text-center lg:text-left">
                <img
                    src={urlFor(item.image)}
                    alt={item.label || `Item ${currentIndex + 1}`}
                    className="w-full max-h-[70vh] object-contain mx-auto"
                />
                {item.description && <p className="mt-4 text-gray-700">{item.description}</p>}
            </div>

            {/* Next Button */}
            <div className="absolute z-10 lg:-right-16 -right-2 bottom-2 scale-50 lg:scale-100 top-[30%] lg:top-[46%]">
                <GeneralNavButton
                    width="38"
                    height="38"
                    direction="right"
                    onClick={goNext}
                    disabled={currentIndex === data.length - 1}
                />
            </div>
        </div>
    );
};

export default LightBox;
