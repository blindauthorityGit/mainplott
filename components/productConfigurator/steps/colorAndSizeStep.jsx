import React, { useState, useEffect } from "react";
import ContentWrapper from "../components/contentWrapper";
import CustomCheckBox from "@/components/inputs/customCheckBox";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";

// STORE
import useStore from "@/store/store"; // Your Zustand store
import formatVariants from "@/functions/formatVariants"; // Function for formatting variants
import { getColorHex } from "@/libs/colors";

export default function ColorAndSizeStep({ product, sizes, colorPatternIds }) {
    const { purchaseData, setPurchaseData, setSelectedVariant, setSelectedImage } = useStore();
    const [selectedSize, setSelectedSize] = useState(purchaseData.selectedSize || null);
    const [selectedColor, setSelectedColor] = useState(purchaseData.selectedColor || null);
    const [isChecked, setIsChecked] = useState(false);

    // Format variants for easier access
    const formattedVariants = formatVariants(product.variants);

    // Set initial selection for size and color
    useEffect(() => {
        if (!selectedSize && !selectedColor) {
            const firstSize = Object.keys(formattedVariants)[0];
            if (firstSize) {
                const firstColor = formattedVariants[firstSize].colors[0]?.color;
                setSelectedSize(firstSize);
                setSelectedColor(firstColor);
                setPurchaseData({ ...purchaseData, selectedSize: firstSize, selectedColor: firstColor });
                // Set initial selected image
                const firstImage = formattedVariants[firstSize].colors[0]?.image;
                setSelectedImage(firstImage);
                setActiveVariant(firstSize, firstColor);
            }
        }
    }, []);

    useEffect(() => {
        setPurchaseData({ ...purchaseData, productName: product.title, product: product });
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
    const handleSizeChange = (size) => {
        setSelectedSize(size);
        setPurchaseData({ ...purchaseData, selectedSize: size });
        // Update selected image when size changes
        const firstColor = formattedVariants[size].colors[0]?.color;
        const firstImage = formattedVariants[size].colors[0]?.image;
        setSelectedImage(firstImage);
        setSelectedColor(firstColor);
        setActiveVariant(size, firstColor);
    };

    // Handle color change
    const handleColorChange = (color) => {
        setSelectedColor(color);
        setPurchaseData({ ...purchaseData, selectedColor: color });
        // Update selected image when color changes
        const image = formattedVariants[selectedSize]?.colors.find((c) => c.color === color)?.image;
        setSelectedImage(image);
        // Set the active variant in Zustand store
        setActiveVariant(selectedSize, color);
    };

    const handleToggle = (newState) => {
        setPurchaseData({ ...purchaseData, example: newState });
        setIsChecked(newState);
        console.log(purchaseData);
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8">
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
                {selectedSize && (
                    <div className="flex space-x-3 mt-4 items-center gap-8 lg:mb-16">
                        <div className="left font-body font-semibold">Farbe</div>
                        <div className="right flex space-x-3">
                            {formattedVariants[selectedSize].colors.map(({ color }, index) => (
                                <CustomCheckBox
                                    key={`color-${index}`}
                                    klasse={`bg-${color}`}
                                    isChecked={selectedColor === color}
                                    onClick={() => handleColorChange(color)}
                                    activeClass=" border-2 border-textColor text-white"
                                    nonActiveClass=" text-black"
                                    style={{ background: getColorHex(color) }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <GeneralCheckBox
                    label="Diesen Artikel ohne Personalisierung zum Probieren bestellen"
                    isChecked={isChecked}
                    onToggle={handleToggle}
                    onClick={() => setIsChecked(!isChecked)}
                    activeClass=""
                    nonActiveClass="bg-background"
                    borderColor="border-textColor"
                    checkColor="text-successColor"
                />
            </ContentWrapper>
        </div>
    );
}
