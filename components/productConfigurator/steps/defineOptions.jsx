import React, { useState, useEffect } from "react";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { H3, P } from "@/components/typography";
import { motion } from "framer-motion";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import formatVariants from "@/functions/formatVariants";
import { calculateTotalPrice } from "@/functions/calculateTotalPrice";
import { calculateTotalPriceAllInclusive } from "@/functions/calculateTotalPriceAllInclusive";
import NumberInputField from "@/components/inputs/numberInputField";
import calculateTotalQuantity from "@/functions/calculateTotalQuantity";
import formatPrice from "@/functions/formatPrice";
import { calculateNetPrice } from "@/functions/calculateNetPrice";
import { getColorHex } from "@/libs/colors";
import { isB2BUser, getUserPiecePrice, getUserTotalPrice } from "@/functions/priceHelpers";

export default function DefineOptions({ product, veredelungen, profiDatenCheck, layoutService }) {
    const { purchaseData, setPurchaseData } = useStore(); // Global state

    const [isChecked, setIsChecked] = useState(purchaseData.profiDatenCheck || false);
    const [price, setPrice] = useState(0);
    const [pricePerPiece, setPricePerPiece] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [allInclusive, setAllInclusive] = useState(false);
    const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [veredelungTotal, setVeredelungTotal] = useState(0);
    const [veredelungPerPiece, setVeredelungPerPiece] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [medianPricePerPiece, setMedianPricePerPiece] = useState(0);

    // Format the raw Shopify variants
    const formattedVariants = formatVariants(product.variants);

    // Detect sub-variant mode (e.g., "Kugelschreiber")
    const useSubVariantMapping = product.tags && product.tags.includes("Kugelschreiber");

    // If we have a min order requirement
    const minOrder = product.mindestBestellMenge?.value ? parseInt(product.mindestBestellMenge.value, 10) : 0;

    // Check “All-Inclusive” from metafield
    useEffect(() => {
        if (product?.preisModell?.value) {
            const preisModellArray = JSON.parse(product.preisModell.value);
            setAllInclusive(preisModellArray.includes("Alles inklusive"));
        } else {
            setAllInclusive(false);
        }
    }, [product.preisModell]);

    console.log("PURCHASEDATA LASTS TEP", purchaseData);

    /**
     * CLEANUP EFFECT:
     *   If sub-variant => remove leftover "size" keys
     *   If not sub-variant => remove leftover "color" keys
     */
    useEffect(() => {
        setPurchaseData((prev) => {
            const updated = { ...prev };
            const newVariants = { ...updated.variants };

            if (useSubVariantMapping) {
                // remove leftover purely “size” keys
                Object.entries(newVariants).forEach(([k, v]) => {
                    if (v && v.color && !v.size) {
                        delete newVariants[k];
                    }
                });
            } else {
                // remove leftover purely “color” keys
                Object.entries(newVariants).forEach(([k, v]) => {
                    if (v && v.size && !v.color) {
                        delete newVariants[k];
                    }
                });
            }
            return { ...prev, variants: newVariants };
        });
    }, [useSubVariantMapping, setPurchaseData]);

    /**
     * Toggling “Profi Datencheck”
     */
    const handleToggle = () => {
        const profiDatenCheckPrice = Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0);
        const profiDatenCheckId = profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.id || null;
        console.log(profiDatenCheckPrice, purchaseData.variants);
        setIsChecked((prev) => {
            const newIsChecked = !prev;
            setPurchaseData((old) => {
                const updatedVariants = { ...old.variants };
                if (newIsChecked) {
                    updatedVariants.profiDatenCheck = {
                        id: profiDatenCheckId,
                        price: profiDatenCheckPrice,
                        quantity: 1,
                    };
                } else {
                    delete updatedVariants.profiDatenCheck;
                }
                return {
                    ...old,
                    profiDatenCheck: newIsChecked,
                    profiDatenCheckPrice: newIsChecked ? profiDatenCheckPrice : 0,
                    variants: updatedVariants,
                };
            });
            return newIsChecked;
        });
    };

    /**
     * Price Calculation Effect
     */
    useEffect(() => {
        const discountData = product.preisReduktion ? JSON.parse(product.preisReduktion.value).discounts : null;

        const profiDatenCheckPrice = isChecked
            ? Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0)
            : 0;

        let productDiscount = 0; // define outside the if/else

        if (allInclusive) {
            const result = calculateTotalPriceAllInclusive(purchaseData.variants, product, discountData, purchaseData);
            const finalTotal = Number(result.totalPrice);

            productDiscount = result.productDiscount ?? 0; // store it here

            setTotalPrice(finalTotal);
            setPrice(finalTotal);
            setPricePerPiece(result.pricePerPiece);
            setVeredelungTotal("0.00");
            setVeredelungPerPiece({});
            setAppliedDiscountPercentage(result.appliedDiscountPercentage);

            console.log("PRODUCT DISCOUNT (allInclusive)", productDiscount);
        } else {
            const {
                totalPrice: complexTotal,
                pricePerPiece: complexPricePiece,
                appliedDiscountPercentage,
                veredelungTotal,
                veredelungPerPiece,
                productDiscount: normalDiscount,
            } = calculateTotalPrice(
                purchaseData.variants,
                product,
                discountData,
                setDiscountApplied,
                veredelungen,
                purchaseData
            );

            productDiscount = normalDiscount ?? 0; // store it here

            console.log("PRODUCT DISCOUNT (normalMode)", productDiscount);

            const numericTotalPrice = parseFloat(complexTotal) || 0;
            setTotalPrice(numericTotalPrice);
            setPrice(numericTotalPrice);
            setPricePerPiece(Number(complexPricePiece));
            setVeredelungTotal(veredelungTotal);
            setVeredelungPerPiece(veredelungPerPiece);
            setAppliedDiscountPercentage(appliedDiscountPercentage);
        }

        // Now productDiscount is defined in both branches
        setPurchaseData((old) => ({
            ...old,
            productDiscount,
            profiDatenCheckPrice,
        }));
    }, [purchaseData.variants, product, isChecked, allInclusive, veredelungen, setPurchaseData, profiDatenCheck]);
    /**
     * Keep store's price up to date
     */
    useEffect(() => {
        setPurchaseData((prev) => ({
            ...prev,
            price,
            totalPrice: price,
            veredelungTotal,
            veredelungPerPiece,
        }));
    }, [price, veredelungTotal, veredelungPerPiece, setPurchaseData]);

    /**
     * Track total quantity & median price
     */
    useEffect(() => {
        const total = calculateTotalQuantity(purchaseData);
        setTotalQuantity(total);
    }, [purchaseData.variants]);

    useEffect(() => {
        if (totalQuantity > 0) {
            const medianPrice = parseFloat((totalPrice / totalQuantity).toFixed(2));
            setMedianPricePerPiece(medianPrice);
        } else {
            setMedianPricePerPiece(0);
        }
    }, [totalPrice, totalQuantity]);

    // --------------------------------------------------
    // RENDER LOGIC
    // --------------------------------------------------

    /**
     * SUB VARIANT MAPPING (“Kugelschreiber”) => keyed by color
     * (Unchanged from your existing code)
     */
    const renderSubVariantMapping = () => {
        return formattedVariants.Standard.colors.map((variant) => {
            const key = variant.color;
            const currentVariant = purchaseData.variants[key] || {
                color: variant.color,
                quantity: 0,
                id: variant.id,
            };

            return (
                <NumberInputField
                    key={variant.id}
                    label={variant.color}
                    color={getColorHex(variant.color)}
                    value={currentVariant.quantity}
                    inputProps={{ min: 0 }}
                    onIncrement={() => {
                        let newQuantity = currentVariant.quantity === 0 ? minOrder : currentVariant.quantity + 1;

                        setPurchaseData((prev) => {
                            const newVariants = { ...prev.variants };
                            newVariants[key] = {
                                ...currentVariant,
                                quantity: newQuantity,
                            };
                            return { ...prev, variants: newVariants };
                        });
                    }}
                    onDecrement={() => {
                        let newQuantity = currentVariant.quantity > minOrder ? currentVariant.quantity - 1 : 0;
                        setPurchaseData((prev) => {
                            const newVariants = { ...prev.variants };
                            if (newQuantity === 0) {
                                delete newVariants[key];
                            } else {
                                newVariants[key] = {
                                    ...currentVariant,
                                    quantity: newQuantity,
                                };
                            }
                            return { ...prev, variants: newVariants };
                        });
                    }}
                    onChange={(e) => {
                        let typed = parseInt(e.target.value, 10) || 0;
                        let newQuantity = 0;
                        if (typed === 0) {
                            newQuantity = 0;
                        } else if (typed < minOrder) {
                            newQuantity = minOrder;
                        } else {
                            newQuantity = typed;
                        }

                        setPurchaseData((prev) => {
                            const newVariants = { ...prev.variants };
                            if (newQuantity === 0) {
                                delete newVariants[key];
                            } else {
                                newVariants[key] = {
                                    ...currentVariant,
                                    quantity: newQuantity,
                                };
                            }
                            return { ...prev, variants: newVariants };
                        });
                    }}
                />
            );
        });
    };

    /**
     * TEXTILE MAPPING => your “old style” approach
     * This snippet uses the global “purchaseData.selectedColor”
     */
    const renderTextileMapping = () => {
        return Object.keys(formattedVariants).map((size) => {
            // This is the old structure you had
            const currentVariant = purchaseData.variants?.[size] || {
                size,
                color: purchaseData.selectedColor || null,
                quantity: 0,
                // fetch the ID based on the currently selected color
                id: formattedVariants[size]?.colors?.find((c) => c.color === purchaseData.selectedColor)?.id || null,
            };

            // console.log(currentVariant);

            return (
                <NumberInputField
                    key={size}
                    label={size === "Default Title" ? product.title : size}
                    value={currentVariant.quantity}
                    onIncrement={() => {
                        // On increment, recalc the ID
                        const updatedId =
                            formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)?.id || null;

                        setPurchaseData({
                            ...purchaseData,
                            variants: {
                                ...purchaseData.variants,
                                [size]: {
                                    ...currentVariant,
                                    quantity: currentVariant.quantity + 1,
                                    id: updatedId,
                                    // Store pricePerPiece if you want
                                    price: pricePerPiece,
                                },
                            },
                        });
                    }}
                    onDecrement={() => {
                        if (currentVariant.quantity > 0) {
                            const updatedId =
                                formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)?.id ||
                                null;

                            setPurchaseData({
                                ...purchaseData,
                                variants: {
                                    ...purchaseData.variants,
                                    [size]: {
                                        ...currentVariant,
                                        quantity: currentVariant.quantity - 1,
                                        id: updatedId,
                                        price: pricePerPiece,
                                    },
                                },
                            });
                        }
                    }}
                    onChange={(e) => {
                        const newQuantity = parseInt(e.target.value, 10) || 0;
                        const updatedId =
                            formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)?.id || null;

                        setPurchaseData({
                            ...purchaseData,
                            variants: {
                                ...purchaseData.variants,
                                [size]: {
                                    ...currentVariant,
                                    quantity: newQuantity,
                                    id: updatedId,
                                    price: pricePerPiece,
                                },
                            },
                        });
                    }}
                />
            );
        });
    };

    // console.log(product?.preisReduktion?.value, product);

    // --------------------------------------------------
    // Return final UI
    // --------------------------------------------------
    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={{ title: "Staffelung" }}>
                {useSubVariantMapping ? renderSubVariantMapping() : renderTextileMapping()}
                {/* {console.log(renderTextileMapping())} */}
                {/* Profi Datencheck Checkbox */}
                <div className="h-8"></div>
                <div className="flex bg-accentColor p-4">
                    <P klasse="!text-xs">
                        Du bist dir noch unsicher: Gerne prüfen wir deine Grafik nochmals auf eine optimale
                        Drucktauglichkeit
                        <span className="font-semibold">
                            <br />+{" "}
                            {getUserPiecePrice(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount)} EUR
                        </span>
                    </P>
                    <GeneralCheckBox label="Profi Datencheck?" isChecked={isChecked} onToggle={handleToggle} />
                </div>

                {/* Price Display */}
                <motion.div
                    className="mt-6 flex flex-wrap lg:flex-nowrap p-4 lg:p-0"
                    initial={{ scale: 1 }}
                    animate={{ scale: discountApplied ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {product.preisReduktion && (
                        <div className="lg:mt-0 lg:pr-16 flex items-end mt-4">
                            <ul className=" text-xs text-textColor !font-body tracking-wider">
                                {JSON.parse(product.preisReduktion.value).discounts.map((discount, index) => (
                                    <li key={index}>
                                        {discount.maxQuantity
                                            ? `Von ${discount.minQuantity} bis ${
                                                  discount.maxQuantity
                                              } Stück: EUR ${calculateNetPrice(discount.price.toFixed(2))}`
                                            : `Ab ${discount.minQuantity} Stück: EUR ${calculateNetPrice(
                                                  discount.price.toFixed(2)
                                              )}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <div className="flex lg:justify-end items-end">
                            <H3 klasse="!mb-2">EUR {formatPrice(price)}</H3>
                            <P klasse="!text-xs mb-2 pl-2">EUR {medianPricePerPiece}/Stk.</P>
                        </div>
                        {/* If layoutService is selected, show extra text */}
                        {purchaseData?.variants?.layoutService && (
                            <P klasse="!text-xs">
                                + EUR {getUserPiecePrice(purchaseData.variants.layoutService.price)} LayoutService
                            </P>
                        )}
                        {purchaseData?.variants?.profiDatenCheck && (
                            <P klasse="!text-xs">
                                + EUR {getUserPiecePrice(purchaseData.variants.profiDatenCheck.price)} Profi Datencheck
                            </P>
                        )}
                        <P klasse="!text-xs">
                            {veredelungPerPiece.front > 0 && `inkl. EUR ${veredelungPerPiece.front} Druck Brust / Stk.`}
                        </P>
                        <P klasse="!text-xs">
                            {veredelungPerPiece.back > 0 && `inkl. EUR ${veredelungPerPiece.back} Druck Rücken / Stk`}
                        </P>
                    </div>
                </motion.div>
            </ContentWrapper>
        </div>
    );
}
