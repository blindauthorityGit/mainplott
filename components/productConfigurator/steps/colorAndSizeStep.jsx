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
    // Ensure `selectedSize` and `selectedColor` are initialized
    // Centralized initialization logic
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initializeSelection = () => {
        const firstSize = Object.keys(formattedVariants)?.[0];
        const firstColor = formattedVariants[firstSize]?.colors?.[0]?.color;

        console.log(firstSize, firstColor);

        if (purchaseData.variants.size && purchaseData.variants.color) {
            setSelectedSize(purchaseData.variants.size);
            setSelectedColor(purchaseData.variants.color);
            // setSelectedImage(
            //     formattedVariants[purchaseData.variants.size]?.colors?.[purchaseData.variants.color]?.image
            // );
            setActiveVariant(purchaseData.variants.size, purchaseData.variants.color);
        } else {
            if (firstSize && firstColor) {
                setSelectedSize(firstSize);
                setSelectedColor(firstColor);
                setSelectedImage(formattedVariants[firstSize]?.colors?.[0]?.image);

                // Update Zustand store
                setPurchaseData({
                    ...purchaseData,
                    selectedSize: firstSize,
                    selectedColor: firstColor,
                });

                // Set the active variant
                setActiveVariant(firstSize, firstColor);
            }
        }
    };

    useEffect(() => {
        // Initialize selection on component mount
        console.log("HALLO", purchaseData.selectedSize, purchaseData.selectedColor);
        console.log("HALLOIOHIOEIOHEIOHEHIOEOIH EH EH OEHEHIO");
        if (!purchaseData.selectedSize || !purchaseData.selectedColor) {
            initializeSelection();
        }
    }, [product]);

    useEffect(() => {
        setPurchaseData({ ...purchaseData, productName: product.title, product: product });
        console.log(product.title, product);

        // setPurchaseData({ ...purchaseData, productName: product.title, product: product });
    }, [product]);

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
    // Handle size change
    const handleSizeChange = (size) => {
        setSelectedSize(size);

        // Get the first available color for the new size
        const firstColor = formattedVariants[size]?.colors?.[0]?.color || null;
        const firstImage = formattedVariants[size]?.colors?.[0]?.image || null;

        setSelectedImage(firstImage);
        setSelectedColor(firstColor);

        // Update purchaseData without overwriting unrelated sizes
        const updatedVariants = {
            ...purchaseData.variants, // Preserve existing variants
            [size]: {
                ...purchaseData.variants?.[size], // Preserve existing data for this size
                size: size,
                color: firstColor, // Update to the first color of the new size
                quantity: purchaseData.variants?.[size]?.quantity || 1, // Preserve quantity or default to 1
            },
        };

        setPurchaseData({
            ...purchaseData,
            variants: updatedVariants,
        });

        setActiveVariant(size, firstColor);
        console.log(purchaseData);
    };

    // Handle color change
    const handleColorChange = (color) => {
        setSelectedColor(color);

        // Update purchaseData for the currently selected size without overwriting unrelated sizes
        const updatedVariants = {
            ...purchaseData.variants, // Preserve existing variants
            [selectedSize]: {
                ...purchaseData.variants?.[selectedSize], // Preserve existing data for this size
                color: color, // Update color only
            },
        };

        setPurchaseData({
            ...purchaseData,
            variants: updatedVariants,
        });

        // Update selected image for the new color
        const image = formattedVariants[selectedSize]?.colors.find((c) => c.color === color)?.image || null;
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
