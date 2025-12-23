import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { StepButton } from "@/components/buttons";
import ContentWrapper from "./components/content/index";
import CustomTextField from "@/components/inputs/customTextField";
import QuantitySelector from "@/components/inputs/quantitySelector";
import { P, H3 } from "@/components/typography";
import dynamic from "next/dynamic";
import { calculateNetPrice } from "@/functions/calculateNetPrice";
import useIsMobile from "@/hooks/isMobile";

// Dynamically import the KonvaLayer component with no SSR (falls später benötigt)
const KonvaLayer = dynamic(() => import("@/components/konva"), { ssr: false });

export default function SimpleConfigurator({ product }) {
    const { purchaseData, setPurchaseData, openCartSidebar, addCartItem } = useStore();

    const [selectedImage, setSelectedImage] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [price, setPrice] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(product?.variants?.edges?.[0]?.node ?? null);

    const containerRef = useRef();
    const isMobile = useIsMobile();

    // Initialisieren/Reset bei Produktwechsel
    useEffect(() => {
        const firstVariant = product?.variants?.edges?.[0]?.node ?? null;
        setSelectedVariant(firstVariant);

        // Bildpriorität: Variant-Bild -> erstes Produktbild
        const fallbackImage = product?.images?.edges?.[0]?.node?.originalSrc ?? null;
        setSelectedImage(firstVariant?.image?.originalSrc ?? fallbackImage);

        setPrice(firstVariant?.priceV2?.amount ?? 0);

        // Store angleichen (ohne fremde Keys zu verlieren)
        setPurchaseData({
            ...purchaseData,
            selectedVariant: firstVariant || undefined,
            quantity: purchaseData.quantity || 1,
            price: firstVariant?.priceV2?.amount ?? 0,
        });

        setInputValue(purchaseData.personalisierungsText || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product]);

    // Variante wechseln
    const handleVariantChange = (variantTitle) => {
        const found = product.variants.edges.find((v) => v.node.title === variantTitle)?.node;
        if (!found) return;

        setSelectedVariant(found);
        setPrice(found.priceV2.amount);

        setPurchaseData({
            ...purchaseData,
            selectedVariant: found,
            price: found.priceV2.amount,
        });

        if (found.image?.originalSrc) {
            setSelectedImage(found.image.originalSrc);
        }
    };

    const handleTextChange = (newValue) => {
        setInputValue(newValue);
        setPurchaseData({
            ...purchaseData,
            personalisierungsText: newValue,
        });
    };

    const qty = purchaseData.quantity > 0 ? purchaseData.quantity : 1;
    const displayTotalNet = (calculateNetPrice(Number(price)) * qty).toFixed(2).replace(".", ",");

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-4 h-full">
            {/* Left - Product Image */}
            <div className="col-span-12 lg:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center lg:min-h-[664px] lg:max-h-[664px] relative">
                    <AnimatePresence mode="wait">
                        {selectedImage && (
                            <img
                                key={selectedImage}
                                src={selectedImage}
                                alt="Main Product"
                                className="w-full object-contain lg:max-h-[664px]"
                            />
                        )}
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
                            <ContentWrapper product={product} />
                            <div className="lg:px-16 mt-8">
                                {/* Variant Dropdown */}
                                {product.variants.edges.length > 1 && (
                                    <select
                                        className="border font-body border-gray-300 rounded-md p-2 mb-4"
                                        value={selectedVariant?.title || product.variants.edges[0].node.title}
                                        onChange={(e) => handleVariantChange(e.target.value)}
                                    >
                                        {product.variants.edges.map((variant) => (
                                            <option
                                                className="font-body"
                                                key={variant.node.id}
                                                value={variant.node.title}
                                            >
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
                                />

                                <QuantitySelector
                                    quantity={purchaseData.quantity || 1}
                                    setQuantity={(newQuantity) =>
                                        setPurchaseData({
                                            ...purchaseData,
                                            quantity: newQuantity,
                                        })
                                    }
                                    onQuantityChange={(newQuantity) => {
                                        setPurchaseData({
                                            ...purchaseData,
                                            quantity: newQuantity,
                                        });
                                    }}
                                />

                                <H3 klasse="!mb-2 mt-8">EUR {displayTotalNet}</H3>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-auto lg:flex justify-end lg:px-16 lg:mt-8">
                        <StepButton
                            onClick={() => {
                                if (!selectedVariant?.id) return;

                                const qtySafe = purchaseData.quantity > 0 ? purchaseData.quantity : 1;

                                const updatedVariants = {
                                    ...purchaseData.variants,
                                    mainVariant: {
                                        id: selectedVariant.id, // <-- WICHTIG: gewählte Variante
                                        quantity: qtySafe,
                                        attributes: [
                                            {
                                                key: "personalisierung",
                                                value: purchaseData.personalisierungsText || "",
                                            },
                                        ],
                                    },
                                };

                                const updatedPurchaseData = {
                                    ...purchaseData,
                                    variants: updatedVariants,
                                    quantity: qtySafe,
                                    product,
                                    productName: product.title,
                                    totalPrice: Number(price) * qtySafe,
                                    selectedVariant, // optional hilfreich
                                };

                                setPurchaseData(updatedPurchaseData);
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
