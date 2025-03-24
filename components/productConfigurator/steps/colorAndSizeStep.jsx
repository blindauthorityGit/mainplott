import React, { useState, useEffect, useRef } from "react";
import ContentWrapper from "../components/contentWrapper";
import CustomCheckBox from "@/components/inputs/customCheckBox";
import CustomDropDown from "@/components/inputs/customDropDown";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import useIsMobile from "@/hooks/isMobile";
import MobileColorSelector from "../mobile/colorChoose";

// STORE
import useStore from "@/store/store";
import formatVariants from "@/functions/formatVariants";
import { getColorHex } from "@/libs/colors";
import useUserStore from "@/store/userStore";
import { calculateNetPrice } from "@/functions/calculateNetPrice";

import { P, H3 } from "@/components/typography";

export default function ColorAndSizeStep({ product, sizes, colorPatternIds }) {
    const { purchaseData, setPurchaseData, selectedVariant, setSelectedVariant, selectedImage, setSelectedImage } =
        useStore();
    const [price, setPrice] = useState(null);

    const [selectedSize, setSelectedSize] = useState(purchaseData.selectedSize || null);
    const [selectedColor, setSelectedColor] = useState(purchaseData.selectedColor || null);
    const [isChecked, setIsChecked] = useState(purchaseData.tryout || false);
    const isMobile = useIsMobile();

    const user = useUserStore((state) => state.user);

    // Define secondaryOptionName from product data.
    const optionNames = product.variants?.edges[0]?.node.selectedOptions.map((opt) => opt.name) || [];
    const secondaryOptionName = optionNames.includes("Farbe") ? "Farbe" : optionNames[1] || "";

    // Format variants for easier access
    const formattedVariants = formatVariants(product.variants);
    console.log("product.variants", formattedVariants, product);

    // Use a ref flag to ensure initialization only happens once per product
    const didInitializeRef = useRef(false);

    // Initialize price based on current purchaseData
    useEffect(() => {
        if (purchaseData.selectedSize && purchaseData.selectedColor) {
            const sizeData = formattedVariants[purchaseData.selectedSize];
            if (sizeData) {
                const colorData = sizeData.colors.find((c) => c.color === purchaseData.selectedColor);
                if (colorData) {
                    setPrice(colorData.price); // Set the price from the matching variant
                }
            }
        }
    }, [purchaseData, formattedVariants]);

    useEffect(() => {
        const initializeSelection = () => {
            const sizeKeys = Object.keys(formattedVariants);
            if (sizeKeys.length === 0) {
                // No size options available – skip initialization.
                if (!purchaseData.selectedSize) setSelectedSize(null);
                if (!purchaseData.selectedColor) setSelectedColor(null);
            }

            const firstSize = sizeKeys[0];
            // Get the first color data for the first size (if any)
            const firstColorData = formattedVariants[firstSize]?.colors?.[0] || {};
            const { color: firstColor, image, backImage, id, price: initialPrice } = firstColorData;

            // Only initialize if there isn't already a size or color selected.
            if (!purchaseData.selectedSize || !purchaseData.selectedColor) {
                const initialSize = purchaseData.selectedSize || firstSize;
                const initialColor = purchaseData.selectedColor || firstColor;
                console.log(initialSize, initialColor);
                setSelectedSize(initialSize);
                setSelectedColor(initialColor);
                setPrice(initialPrice);

                // Set the first image and active variant
                setSelectedImage(formattedVariants[initialSize]?.colors?.[0]?.image);
                setActiveVariant(initialSize, initialColor);

                // Update the purchaseData
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
                            price: initialPrice,
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
        console.log(activeColorData);
        if (activeColorData) {
            const { backImage, image, id, price: variantPrice, configImage, configImageUrl } = activeColorData;

            // Create a simplified "variant node" object
            const activeVariantNode = {
                id: id,
                image: { originalSrc: image },
                backImageUrl: backImage,
                configImage: configImage || null,
                configImageUrl: configImageUrl || null,
            };

            console.log(activeVariantNode);

            // Update Zustand store with the variant data
            setSelectedVariant(activeVariantNode);
            setSelectedImage(image);
            setPrice(variantPrice);

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

        const currentColorIsValid = formattedVariants[newSize]?.colors?.some((c) => c.color === selectedColor);

        let finalColor, finalImage, finalBackImage, finalId, finalPrice;

        if (currentColorIsValid && selectedColor) {
            const matchingColorData = formattedVariants[newSize].colors.find((c) => c.color === selectedColor);
            finalColor = matchingColorData.color;
            finalImage = matchingColorData.image;
            finalBackImage = matchingColorData.backImage;
            finalId = matchingColorData.id;
            finalPrice = matchingColorData.price;
        } else {
            const firstColorData = formattedVariants[newSize]?.colors?.[0] || {};
            finalColor = firstColorData.color || "";
            finalImage = firstColorData.image || "";
            finalBackImage = firstColorData.backImage || "";
            finalId = firstColorData.id || "";
            finalPrice = firstColorData.price || "";
        }

        setSelectedColor(finalColor);
        setSelectedImage(finalImage);
        setPrice(finalPrice);

        const updatedVariants = {
            [newSize]: {
                size: newSize,
                color: finalColor,
                quantity: purchaseData.variants[newSize]?.quantity || 1,
                id: finalId,
                price: finalPrice,
            },
        };

        setPurchaseData({
            ...purchaseData,
            selectedSize: newSize,
            selectedColor: finalColor,
            backImage: finalBackImage,
            selectedVariantId: finalId,
            variants: updatedVariants,
        });

        setActiveVariant(newSize, finalColor);
    };

    // Handle color change
    const handleColorChange = (color) => {
        setSelectedColor(color);

        const selectedColorData = formattedVariants[selectedSize]?.colors.find((c) => c.color === color) || {};
        const { image, backImage, id: variantId, price: variantPrice } = selectedColorData;
        console.log(backImage);

        const updatedVariants = {
            ...purchaseData.variants,
            [selectedSize]: {
                ...purchaseData.variants[selectedSize],
                color: color,
                id: variantId,
                price: variantPrice,
            },
        };

        setPurchaseData({
            ...purchaseData,
            selectedColor: color,
            backImage: backImage,
            selectedVariantId: variantId,
            variants: updatedVariants,
        });

        setSelectedImage(image);
        setPrice(variantPrice);
        console.log("COLORE CHANGE", selectedSize, color, backImage);
        setActiveVariant(selectedSize, color, backImage);
    };

    const handleToggle = (newState) => {
        setPurchaseData({
            ...purchaseData,
            tryout: newState,
            quantity: 1,
            cartImage: selectedImage,
            totalPrice: price,
        });
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
                {Object.keys(formattedVariants).length > 1 && (
                    <div className="flex space-x-3 items-center gap-8 lg:mt-16">
                        <div className="left font-body text-textColor font-semibold">Größe</div>
                        <div className="right flex flex-wrap gap-x-3 gap-y-2">
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
                )}

                {!isMobile && selectedSize && secondaryOptionName == "Farbe" && (
                    <div
                        className={`flex space-x-3 mt-4 items-center gap-8 lg:mb-16 ${
                            Object.keys(formattedVariants).length > 1 ? "" : "lg:mt-16"
                        }`}
                    >
                        <div className="left font-body font-semibold">Farbe</div>
                        <div className="right flex flex-wrap -mx-1 -my-1 ">
                            {formattedVariants[selectedSize]?.colors?.map(({ color }, index) => (
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
                                        showTooltip={true}
                                        showLabel={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conditionally render dropdown when secondary option is not "Farbe" */}
                {!isMobile && selectedSize && secondaryOptionName && secondaryOptionName !== "Farbe" && (
                    <div className="flex space-x-3 mt-4 items-center gap-8 lg:mb-16">
                        <div className="left font-body font-semibold">{secondaryOptionName}</div>
                        <div className="right">
                            <CustomDropDown
                                options={formattedVariants[selectedSize]?.colors.map((item) => item.color)}
                                value={selectedColor}
                                onChange={handleColorChange}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex justify-end items-end mt-8">
                        <H3 klasse="!mb-2">EUR {calculateNetPrice(Number(price)).toFixed(2) || "0.00"}</H3>
                    </div>
                </div>
                {user?.userType === "firmenkunde" ? (
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
