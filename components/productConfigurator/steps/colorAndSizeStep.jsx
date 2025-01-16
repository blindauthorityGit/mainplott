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
import useUserStore from "@/store/userStore";

export default function ColorAndSizeStep({ product, sizes, colorPatternIds }) {
    const { purchaseData, setPurchaseData, selectedVariant, setSelectedVariant, selectedImage, setSelectedImage } =
        useStore();
    const [selectedSize, setSelectedSize] = useState(purchaseData.selectedSize || null);
    const [selectedColor, setSelectedColor] = useState(purchaseData.selectedColor || null);
    const [isChecked, setIsChecked] = useState(purchaseData.tryout || false);
    const isMobile = useIsMobile();

    const user = useUserStore((state) => state.user);

    // Format variants for easier access
    const formattedVariants = formatVariants(product.variants);
    console.log("product.variants", formattedVariants);
    // console.log(formattedVariants, product.variants);
    // Ensure `selectedSize` and `selectedColor` are initialized
    // Centralized initialization logic
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const initializeSelection = () => {
            const firstSize = Object.keys(formattedVariants)?.[0];
            const firstColorData = formattedVariants[firstSize]?.colors?.[0] || {};
            const { color: firstColor, image, backImage, id: id } = firstColorData;

            // console.log(firstID);

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
                    backImage,
                    productName: product.title,
                    product,
                    variants: {
                        ...purchaseData.variants,
                        [initialSize]: {
                            size: initialSize,
                            color: initialColor,
                            quantity: purchaseData.variants?.[initialSize]?.quantity || 1,
                            id: id,
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

    useEffect(() => {
        console.log(selectedVariant);
    }, [selectedVariant]);

    // Revised setActiveVariant function
    const setActiveVariant = (size, color) => {
        // Use formattedVariants instead of product.variants.edges
        const sizeData = formattedVariants[size];
        if (!sizeData || !sizeData.colors) return;

        // Find the corresponding color data from formatted variants
        const activeColorData = sizeData.colors.find((c) => c.color === color);
        if (activeColorData) {
            const { backImage, image, id } = activeColorData;

            // Create a simplified "variant node" object
            const activeVariantNode = {
                id: id,
                image: { originalSrc: image },
                backImageUrl: backImage, // Use our computed backImage
            };

            // Update Zustand store with the variant data
            setSelectedVariant(activeVariantNode);
            setSelectedImage(image);
            setPurchaseData((prevData) => ({
                ...prevData,
                backImage: backImage,
                selectedVariantId: id,
            }));
        }
    };

    // Handle size change
    const handleSizeChange = (newSize) => {
        setSelectedSize(newSize);

        // 1) Attempt to see if the current selectedColor is valid for this newSize
        const currentColorIsValid = formattedVariants[newSize]?.colors?.some((c) => c.color === selectedColor);

        let finalColor;
        let finalImage;
        let finalBackImage;
        let finalId;

        if (currentColorIsValid && selectedColor) {
            // If the user’s current color is valid, do nothing special, keep it
            const matchingColorData = formattedVariants[newSize].colors.find((c) => c.color === selectedColor);
            finalColor = matchingColorData.color;
            finalImage = matchingColorData.image;
            finalBackImage = matchingColorData.backImage;
            finalId = matchingColorData.id;
        } else {
            // If it’s invalid (or no color was selected), pick the first color
            const firstColorData = formattedVariants[newSize]?.colors?.[0] || {};
            finalColor = firstColorData.color || "";
            finalImage = firstColorData.image || "";
            finalBackImage = firstColorData.backImage || "";
            finalId = firstColorData.id || "";
        }

        setSelectedColor(finalColor);
        setSelectedImage(finalImage);

        // 2) Update purchaseData.variants
        const updatedVariants = {
            [newSize]: {
                size: newSize,
                color: finalColor,
                // If there's already a quantity set for this size, keep it. Otherwise default to 1
                quantity: purchaseData.variants[newSize]?.quantity || 1,
                id: finalId,
            },
        };

        // 3) Update purchaseData
        setPurchaseData({
            ...purchaseData,
            selectedSize: newSize,
            selectedColor: finalColor,
            backImage: finalBackImage,
            selectedVariantId: finalId,
            variants: updatedVariants,
        });

        // 4) Update the active variant in the store
        setActiveVariant(newSize, finalColor);
    };

    // Handle color change
    // Handle color change
    const handleColorChange = (color) => {
        setSelectedColor(color);

        // Find the image and ID for the selected size and color
        const selectedColorData = formattedVariants[selectedSize]?.colors.find((c) => c.color === color) || {};
        const { image, backImage, id: variantId } = selectedColorData;
        console.log(backImage);

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
            backImage: backImage, // Update the back image URL
            selectedVariantId: variantId, // Update the selectedVariantId in purchaseData
            variants: updatedVariants, // Update the entire variants object
        });

        setSelectedImage(image);
        console.log("COLORE CHANGE", selectedSize, color, backImage);
        setActiveVariant(selectedSize, color, backImage);
    };

    const handleToggle = (newState) => {
        setPurchaseData({ ...purchaseData, tryout: newState, quantity: 1, cartImage: selectedImage, totalPrice: 0 });
        setIsChecked(newState);
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-4 2xl:mt-8">
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
                    <div className="right flex flex-wrap gap-x-3 gap-y-2">
                        {Object.keys(formattedVariants).map((size, i) => (
                            <CustomCheckBox
                                key={`size-${i}`}
                                label={size}
                                isChecked={selectedSize === size}
                                onClick={() => handleSizeChange(size)}
                                activeClass="border-2 border-textColor text-white"
                                nonActiveClass="opacity-60 text-black "
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
                                        klasse={`bg-${color} `}
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
                {user?.userType == "firmenkunde" ? (
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
                ) : null}
            </ContentWrapper>
        </div>
    );
}
