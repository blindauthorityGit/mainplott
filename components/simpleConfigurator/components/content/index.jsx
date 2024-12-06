import React, { useState, useEffect } from "react";
import ContentWrapper from "./contentWrapper";
import CustomCheckBox from "@/components/inputs/customCheckBox";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import useIsMobile from "@/hooks/isMobile";

// STORE
import useStore from "@/store/store"; // Your Zustand store
import formatVariants from "@/functions/formatVariants"; // Function for formatting variants
import { getColorHex } from "@/libs/colors";

export default function SimpleStep({ product }) {
    const { purchaseData, setPurchaseData, setSelectedVariant, setSelectedImage } = useStore();
    const [selectedSize, setSelectedSize] = useState(purchaseData.selectedSize || null);
    const [selectedColor, setSelectedColor] = useState(purchaseData.selectedColor || null);
    const [isChecked, setIsChecked] = useState(purchaseData.tryout || false);
    const isMobile = useIsMobile();

    // Format variants for easier access
    const formattedVariants = formatVariants(product.variants);
    // console.log(formattedVariants, product.variants);
    // Ensure `selectedSize` and `selectedColor` are initialized

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8">
            {/* Mobile Color Selector */}

            <ContentWrapper data={product}>
                {/* <div className="flex space-x-3 items-center gap-8 lg:mt-16">
                    <div className="left font-body font-semibold">Größe</div>
                    <div className="right flex space-x-3">
                        {Object.keys(formattedVariants).map((size, i) => (
                            <CustomCheckBox
                                key={`size-${i}`}
                                label={size}
                                isChecked={selectedSize === size}
                                onClick={() => handleSizeChange(size)}
                                activeClass="border-2 border-textColor text-white"
                                nonActiveClass="opacity-60 text-black"
                                offsetColor="bg-primaryColor-200"
                            />
                        ))}
                    </div>
                </div>
                {!isMobile && selectedSize && (
                    <div className="flex space-x-3 mt-4 items-center gap-8 lg:mb-16">
                        <div className="left font-body font-semibold">Farbe</div>
                        <div className="right flex flex-wrap -mx-1 -my-1 ">
                            {formattedVariants[selectedSize]?.colors?.map(
                                ({ color }, index) => (
                                    console.log(getColorHex(color)),
                                    (
                                        <div key={`color-${index}`} className="px-1 py-1">
                                            <CustomCheckBox
                                                key={`color-${index}`}
                                                klasse={`bg-${color} !w-6 !h-6 lg:!w-10 lg:!h-10`}
                                                isChecked={selectedColor === color}
                                                onClick={() => handleColorChange(color)}
                                                activeClass=" border-2 border-textColor text-white"
                                                nonActiveClass=" text-black"
                                                style={{ background: getColorHex(color) }}
                                                label={color}
                                                showTooltip={true} // Enable the tooltip
                                                showLabel={false}
                                            />{" "}
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>
                )} */}
                {/* <GeneralCheckBox
                    label="Diesen Artikel ohne Personalisierung zum Probieren bestellen"
                    isChecked={isChecked}
                    onToggle={handleToggle}
                    onClick={() => setIsChecked(!isChecked)}
                    activeClass=""
                    nonActiveClass="bg-background"
                    borderColor="border-textColor"
                    checkColor="text-successColor"
                /> */}
            </ContentWrapper>
        </div>
    );
}
