import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import ContentWrapper from "./components/content/index";
import CustomTextField from "@/components/inputs/customTextField";
import QuantitySelector from "@/components/inputs/quantitySelector";
import { P, H3 } from "@/components/typography";
import dynamic from "next/dynamic";

//Hooks
import useIsMobile from "@/hooks/isMobile";

// Dynamically import the KonvaLayer component with no SSR
const KonvaLayer = dynamic(() => import("@/components/konva"), { ssr: false });

export default function SimpleConfigurator({ product }) {
    const { purchaseData, setPurchaseData, openCartSidebar, addCartItem } = useStore();

    const [selectedImage, setSelectedImage] = useState(null); // Start with the first image
    const [inputValue, setInputValue] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const containerRef = useRef(); // Add a reference to the container
    const isMobile = useIsMobile();

    useEffect(() => {
        setSelectedImage(product.images.edges[0].node.originalSrc);
    }, [product]);

    useEffect(() => {
        setPrice(product.variants.edges[0].node.priceV2.amount);
    }, [product]);

    const handleVariantChange = (variantTitle) => {
        const selectedVariant = product.variants.edges.find((variant) => variant.node.title === variantTitle);

        if (selectedVariant) {
            setPurchaseData({
                ...purchaseData,
                selectedVariant: selectedVariant.node,
                price: selectedVariant.node.priceV2.amount,
            });
            setPrice(selectedVariant.node.priceV2.amount);

            if (selectedVariant.node.image?.originalSrc) {
                setSelectedImage(selectedVariant.node.image.originalSrc);
            }
        }
    };

    const handleTextChange = (newValue) => {
        setInputValue(newValue);
        setPurchaseData({
            ...purchaseData,
            personalisierungsText: newValue, // Update the customization text in Zustand
        });
    };

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-4 h-full">
            {/* Left - Product Image */}
            <div className="col-span-12 lg:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center lg:min-h-[664px] lg:max-h-[664px] relative">
                    <AnimatePresence mode="wait">
                        <img
                            key={selectedImage}
                            src={selectedImage}
                            alt="Main Product"
                            className="w-full object-contain lg:max-h-[664px]"
                        />
                    </AnimatePresence>
                </div>
                <div className="flex mt-4 gap-2">
                    {product.images.edges.map((image, index) => (
                        <img
                            key={index}
                            src={image.node.originalSrc}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-16 h-16 cursor-pointer object-cover border-2 ${
                                selectedImage === image.node.originalSrc ? "border-primaryColor" : "border-gray-300"
                            }`}
                            onClick={() => setSelectedImage(image.node.originalSrc)}
                        />
                    ))}
                </div>
            </div>

            {/* Right - Variant Selector and Quantity */}
            <div className="col-span-12 lg:col-span-6 lg:pt-2 flex flex-col h-full">
                <div className="flex-grow mb-8 px-4 lg:px-0">
                    <AnimatePresence mode="wait" layout initial={false}>
                        <motion.div
                            layout
                            key={"currentStep"}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <ContentWrapper product={product}></ContentWrapper>
                            <div className="lg:px-16 mt-8">
                                {/* Render Dropdown if multiple variants exist */}
                                {product.variants.edges.length > 1 && (
                                    <select
                                        className="border border-gray-300 rounded-md p-2 mb-4"
                                        onChange={(e) => handleVariantChange(e.target.value)}
                                    >
                                        {product.variants.edges.map((variant) => (
                                            <option key={variant.node.id} value={variant.node.title}>
                                                {variant.node.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <P klasse="lg:!text-sm">{product?.textPersonalisierung?.value}</P>
                                <CustomTextField
                                    value={inputValue}
                                    onChange={handleTextChange}
                                    maxLength={80}
                                    placeholder="Personalisierung...."
                                ></CustomTextField>
                                <QuantitySelector
                                    quantity={purchaseData.quantity || 1}
                                    setQuantity={(newQuantity) =>
                                        setPurchaseData({
                                            ...purchaseData,
                                            quantity: newQuantity,
                                        })
                                    }
                                    onQuantityChange={(newQuantity) => {
                                        // Handle any additional logic you need when the quantity changes
                                        console.log("Quantity changed:", newQuantity);
                                        setPurchaseData({
                                            ...purchaseData,
                                            quantity: newQuantity,
                                        });
                                    }}
                                />

                                <H3 klasse="!mb-2 mt-8">
                                    EUR {(Number(price) * (purchaseData.quantity || 1)).toFixed(2)}
                                </H3>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="mt-auto lg:flex justify-end hidden lg:px-16 lg:mt-8">
                        <StepButton
                            onClick={() => {
                                const updatedVariants = {
                                    ...purchaseData.variants,
                                    mainVariant: {
                                        id: product.variants.edges[0].node.id, // Assuming the first variant is used
                                        quantity: purchaseData.quantity > 0 ? purchaseData.quantity : 1,
                                        attributes: [
                                            {
                                                key: "personalisierung",
                                                value: purchaseData.personalisierungsText || "", // Add the personalisierungsText
                                            },
                                        ],
                                    },
                                };

                                const updatedPurchaseData = {
                                    ...purchaseData,
                                    variants: updatedVariants,
                                    quantity: purchaseData.quantity > 0 ? purchaseData.quantity : 1,
                                    product: product,
                                    productName: product.title,
                                    totalPrice: Number(price) * (purchaseData.quantity || 1),
                                };

                                // Update Zustand store with the prepared data
                                setPurchaseData(updatedPurchaseData);

                                // Add the item to the cart and open the sidebar
                                addCartItem({ ...updatedPurchaseData, selectedImage });
                                openCartSidebar();
                            }}
                            className="px-4 py-2 !bg-successColor text-white rounded"
                            klasse="!bg-successColor"
                        >
                            In den Einkaufswagen
                        </StepButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
