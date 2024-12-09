import React, { useState, useEffect } from "react";
import ContentWrapper from "../components/contentWrapper";
import CustomCheckBox from "@/components/inputs/customCheckBox";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import useIsMobile from "@/hooks/isMobile";
import MobileColorSelector from "../mobile/colorChoose";

// STORE
import useStore from "@/store/store"; // Your Zustand store
import formatVariants from "@/functions/formatVariants"; // Function for formatting variants
import { getColorHex } from "@/libs/colors";

export default function ColorAndSizeStep({ product, sizes, colorPatternIds }) {
    const { purchaseData, setPurchaseData, setSelectedVariant, setSelectedImage } = useStore();
    const [selectedSize, setSelectedSize] = useState(purchaseData.selectedSize || null);
    const [selectedColor, setSelectedColor] = useState(purchaseData.selectedColor || null);
    const [isChecked, setIsChecked] = useState(purchaseData.tryout || false);
    const isMobile = useIsMobile();

    // Format variants for easier access
    const formattedVariants = formatVariants(product.variants);
    console.log(product.variants, formattedVariants);
    // console.log(formattedVariants, product.variants);
    // Ensure `selectedSize` and `selectedColor` are initialized
    // Centralized initialization logic
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const initializeSelection = () => {
            const firstSize = Object.keys(formattedVariants)?.[0];
            const firstColor = formattedVariants[firstSize]?.colors?.[0]?.color;
            const firstID = formattedVariants[firstSize]?.colors?.[0]?.id;

            console.log(firstID);

            if (!purchaseData.selectedSize || !purchaseData.selectedColor) {
                const initialSize = purchaseData.selectedSize || firstSize;
                const initialColor = purchaseData.selectedColor || firstColor;
                console.log(initialSize, initialColor);
                setSelectedSize(initialSize);
                setSelectedColor(initialColor);

                // Set the first image and active variant
                setSelectedImage(formattedVariants[initialSize]?.colors?.[0]?.image);
                setActiveVariant(initialSize, initialColor);

                // Initialize purchaseData with proper variants
                setPurchaseData({
                    ...purchaseData,
                    selectedSize: initialSize,
                    selectedColor: initialColor,
                    productName: product.title,
                    product,
                    variants: {
                        ...purchaseData.variants,
                        [initialSize]: {
                            size: initialSize,
                            color: initialColor,
                            quantity: purchaseData.variants?.[initialSize]?.quantity || 1,
                            id: firstID,
                        },
                    },
                });
            }
        };

        initializeSelection();
    }, [product, formattedVariants]);

    useEffect(() => {
        console.log(purchaseData);
    }, [purchaseData]);

    // Function to set the active variant
    const setActiveVariant = (size, color) => {
        const activeVariant = product.variants.edges.find(
            ({ node }) =>
                node.selectedOptions.some((option) => option.name === "Größe" && option.value === size) &&
                node.selectedOptions.some((option) => option.name === "Farbe" && option.value === color)
        );
        console.log(activeVariant);
        if (activeVariant) {
            setSelectedVariant(activeVariant.node);
        }
    };

    // Handle size change
    const handleSizeChange = (size) => {
        setSelectedSize(size);

        // Get the first available color for the new size
        const firstColor = formattedVariants[size]?.colors?.[0]?.color || null;
        const firstImage = formattedVariants[size]?.colors?.[0]?.image || null;
        const firstId = formattedVariants[size]?.colors?.[0]?.id || null;

        setSelectedImage(firstImage);
        setSelectedColor(firstColor);

        // Replace the specific size entry in purchaseData.variants
        const updatedVariants = {
            [size]: {
                size: size,
                color: firstColor,
                quantity: 1, // Default quantity
                id: firstId, // Update the variant ID
            },
        };

        setPurchaseData({
            ...purchaseData,
            selectedSize: size,
            selectedColor: firstColor,
            variants: updatedVariants, // Replace the current variants object with the new one
            selectedVariantId: firstId, // Update the selectedVariantId in purchaseData
        });

        setActiveVariant(size, firstColor);
        console.log(purchaseData);
    };

    // Handle color change
    const handleColorChange = (color) => {
        setSelectedColor(color);

        // Find the image and ID for the selected size and color
        const selectedColorData = formattedVariants[selectedSize]?.colors.find((c) => c.color === color) || {};
        const image = selectedColorData.image || null;
        const variantId = selectedColorData.id || null;

        // Update only the color and ID for the currently selected size
        const updatedVariants = {
            ...purchaseData.variants, // Preserve existing size entries
            [selectedSize]: {
                ...purchaseData.variants[selectedSize], // Preserve existing data for the current size
                color: color, // Update the color
                id: variantId, // Update the variant ID
            },
        };

        setPurchaseData({
            ...purchaseData,
            selectedColor: color,
            selectedVariantId: variantId, // Update the selectedVariantId in purchaseData
            variants: updatedVariants, // Update the entire variants object
        });

        setSelectedImage(image);

        setActiveVariant(selectedSize, color);
        console.log(purchaseData);
    };

    const handleToggle = (newState) => {
        setPurchaseData({ ...purchaseData, tryout: newState });
        setIsChecked(newState);
        console.log(purchaseData);
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8">
            {/* Mobile Color Selector */}
            {isMobile && selectedSize && (
                <MobileColorSelector
                    colors={formattedVariants[selectedSize]?.colors}
                    selectedColor={selectedColor}
                    onColorChange={handleColorChange}
                />
            )}
            <ContentWrapper data={product}>
                <div className="flex space-x-3 items-center gap-8 lg:mt-16">
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
                            {formattedVariants[selectedSize]?.colors?.map(({ color }, index) => (
                                // console.log(getColorHex(color)),
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
                            ))}
                        </div>
                    </div>
                )}
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
