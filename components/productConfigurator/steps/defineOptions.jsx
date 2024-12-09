import React, { useState, useEffect } from "react";
import { Button, TextField, InputAdornment } from "@mui/material";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import QuantitySelector from "@/components/inputs/quantitySelector";
import Dropdown from "@/components/inputs/dropdown"; // Adjust the path as needed
import AdditionalInfoField from "@/components/inputs/infoField";
import { H3, P } from "@/components/typography";
import { motion } from "framer-motion";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import formatVariants from "@/functions/formatVariants"; // Function for formatting variants
import { calculateTotalPrice } from "@/functions/calculateTotalPrice"; // Function for formatting variants
import NumberInputField from "@/components/inputs/numberInputField"; // Adjust the import path as necessary

export default function DefineOptions({ product, veredelungen, profiDatenCheck }) {
    const { purchaseData, setPurchaseData } = useStore(); // Zustand global state
    const [isChecked, setIsChecked] = useState(purchaseData.profiDatenCheck || false); // Initialize based on Zustand state

    const [quantity, setQuantity] = useState(1);

    const [coupon, setCoupon] = useState("");
    const [price, setPrice] = useState(0);
    const [pricePerPiece, setPricePerPiece] = useState(0);
    const [veredelungPiece, setVeredelungPiece] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0); // Track the applied discount percentage

    const [additionalInfo, setAdditionalInfo] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);
    const [veredelungTotal, setVeredelungTotal] = useState(0);
    const [veredelungPerPiece, setVeredelungPerPiece] = useState({});

    const stepData = {
        title: "Staffelung",
    };

    const formattedVariants = formatVariants(product.variants);

    const veredelungOptions = [
        { label: "Druck", value: "druck" },
        { label: "Stickerei", value: "stickerei" },
        { label: "Gravur", value: "gravur" },
    ];

    // Toggle handler to update both local state and Zustand global state
    const handleToggle = () => {
        const profiDatenCheckPrice = parseFloat(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0);
        const profiDatenCheckId = profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.id || null;

        setIsChecked((prev) => {
            const newIsChecked = !prev;

            // Dynamically adjust the total price
            setPrice((prevPrice) =>
                newIsChecked ? prevPrice + profiDatenCheckPrice : prevPrice - profiDatenCheckPrice
            );

            // Update Zustand state directly
            const updatedVariants = { ...purchaseData.variants };

            if (newIsChecked) {
                // Add profiDatenCheck as a separate variant
                updatedVariants.profiDatenCheck = {
                    id: profiDatenCheckId,
                    price: profiDatenCheckPrice,
                };
            } else {
                // Remove profiDatenCheck
                delete updatedVariants.profiDatenCheck;
            }

            setPurchaseData({
                ...purchaseData,
                profiDatenCheck: newIsChecked,
                profiDatenCheckPrice: newIsChecked ? profiDatenCheckPrice : 0,
                variants: updatedVariants,
            });

            return newIsChecked;
        });
    };

    useEffect(() => {
        setPurchaseData({
            ...purchaseData,
            price: price,
        });
    }, [price]);

    useEffect(() => {
        // Update each variant with the calculated price per piece
        const updatedVariants = Object.keys(purchaseData.variants).reduce((acc, key) => {
            const variant = purchaseData.variants[key];
            acc[key] = {
                ...variant,
                price: pricePerPiece, // Set or update the price for each variant
            };
            return acc;
        }, {});

        // Update purchaseData with the modified variants
        setPurchaseData((prevPurchaseData) => ({
            ...prevPurchaseData,
            variants: updatedVariants,
        }));
    }, [pricePerPiece, purchaseData.variants]); // Trigger when pricePerPiece or variants change

    useEffect(() => {
        const discountData = product.preisReduktion ? JSON.parse(product.preisReduktion.value).discounts : null;

        const { totalPrice, pricePerPiece, appliedDiscountPercentage, veredelungTotal, veredelungPerPiece } =
            calculateTotalPrice(
                purchaseData.variants,
                product,
                discountData,
                setDiscountApplied,
                veredelungen,
                purchaseData
            );
        console.log("TOTALPRICE", totalPrice);
        setTotalPrice(totalPrice);
        setVeredelungTotal(veredelungTotal);
        setVeredelungPerPiece(veredelungPerPiece);
        setPricePerPiece(Number(pricePerPiece));

        console.log(veredelungPerPiece);

        // Ensure profiDatenCheckPrice is a valid number
        const profiDatenCheckPrice = isChecked
            ? Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0)
            : 0;

        // Ensure totalPrice is a number (already calculated in calculateTotalPrice)
        const numericTotalPrice = parseFloat(totalPrice) || 0;

        setPurchaseData({
            ...purchaseData,
            profiDatenCheckPrice: profiDatenCheckPrice,
        });

        // Properly format the price to avoid excessive decimals
        const formattedPrice = (numericTotalPrice + profiDatenCheckPrice).toFixed(2);

        setVeredelungPiece(veredelungPerPiece);
        setPrice(parseFloat(formattedPrice)); // Ensure it stays as a number
        setAppliedDiscountPercentage(appliedDiscountPercentage);
    }, [purchaseData, product, isChecked]); // Include isChecked as a dependency

    // Include isChecked as a dependency
    // useEffect(() => {
    //     setPrice(price + Number(profiDatenCheck[0].node.variants.edges[0].node.price.amount));
    // }, [isChecked]);

    // Handle Veredelung change
    const handleVeredelungChange = (event) => setVeredelung(event.target.value);

    // Handle coupon code verification
    const handleCouponCheck = () => {
        if (coupon.toLowerCase() === "billige") {
            setDiscountApplied(true);
        } else {
            alert("Ungültiger Gutscheincode"); // Basic feedback for invalid code
            setDiscountApplied(false);
        }
    };

    useEffect(() => {
        setPurchaseData({
            ...purchaseData,
            totalPrice: price,
            veredelungTotal: veredelungTotal,
            veredelungPerPiece: veredelungPerPiece,
        });
    }, [totalPrice, veredelungTotal, veredelungPerPiece, price]);

    console.log(profiDatenCheck);

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={stepData}>
                {/* Discounts List */}

                {/* Quantity Selector */}
                {/* <QuantitySelector quantity={quantity} setQuantity={setQuantity} /> */}
                {Object.keys(formattedVariants).map((size) => {
                    const currentVariant = purchaseData.variants?.[size] || {
                        size,
                        color:
                            purchaseData.variants?.[size]?.color || formattedVariants[size]?.colors?.[0]?.color || null, // Fetch size-specific color
                        quantity: 0, // Default quantity
                        id: formattedVariants[size]?.colors?.[0]?.id || null, // Fetch size-specific ID
                    };
                    // console.log(size);
                    // console.log(purchaseData.variants?.[size]);

                    return (
                        <NumberInputField
                            key={size}
                            label={size}
                            value={currentVariant.quantity} // Prefill with the current quantity for this size
                            onIncrement={() => {
                                const updatedId =
                                    formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)
                                        ?.id || null;
                                setPurchaseData({
                                    ...purchaseData,
                                    variants: {
                                        ...purchaseData.variants, // Preserve other sizes
                                        [size]: {
                                            ...currentVariant, // Preserve current variant details (size, color)
                                            quantity: currentVariant.quantity + 1, // Increment quantity
                                            id: updatedId, // Update the ID
                                            price: pricePerPiece,
                                        },
                                    },
                                });
                            }}
                            onDecrement={() => {
                                if (currentVariant.quantity > 0) {
                                    const updatedId =
                                        formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)
                                            ?.id || null;
                                    setPurchaseData({
                                        ...purchaseData,
                                        variants: {
                                            ...purchaseData.variants, // Preserve other sizes
                                            [size]: {
                                                ...currentVariant, // Preserve current variant details (size, color)
                                                quantity: currentVariant.quantity - 1, // Decrement quantity
                                                id: updatedId, // Update the ID
                                                price: pricePerPiece,
                                            },
                                        },
                                    });
                                }
                            }}
                            onChange={(e) => {
                                const newQuantity = parseInt(e.target.value, 10) || 0;
                                const updatedId =
                                    formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)
                                        ?.id || null;
                                setPurchaseData({
                                    ...purchaseData,
                                    variants: {
                                        ...purchaseData.variants, // Preserve other sizes
                                        [size]: {
                                            ...currentVariant, // Preserve current variant details (size, color)
                                            quantity: newQuantity, // Set new quantity
                                            id: updatedId, // Update the ID
                                            price: pricePerPiece,
                                        },
                                    },
                                });
                            }}
                        />
                    );
                })}
                {/* Veredelungen Dropdown */}
                {/* <Dropdown
                    label="Veredelungen"
                    value={veredelung}
                    onChange={handleVeredelungChange}
                    options={veredelungOptions}
                /> */}
                {/* Additional Info Field */}
                {/* <AdditionalInfoField value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} /> */}
                {/* Profi Datencheck Checkbox */}
                <div className="h-8"></div>
                <div className="flex bg-accentColor p-4">
                    {" "}
                    <P klasse="!text-xs">
                        Wir checken Ihre Daten nach optimaler Drucktauglichkeit
                        <span className="font-semibold">
                            {" "}
                            <br />+ {profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount} EUR
                        </span>
                    </P>
                    <GeneralCheckBox
                        label="Profi Datencheck?"
                        isChecked={isChecked}
                        onToggle={handleToggle} // Only pass onToggle
                        activeClass=""
                        nonActiveClass="bg-background"
                        borderColor="border-textColor"
                        checkColor="text-successColor"
                    />
                </div>
                {/* Price Display */}
                <motion.div
                    className="mt-6 flex"
                    initial={{ scale: 1 }}
                    animate={{ scale: discountApplied ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div>
                        <H3 klasse="!mb-2">EUR {totalPrice}</H3>
                        <P klasse="!text-xs">
                            {veredelungPiece.front > 0 && `inkl. EUR ${veredelungPiece.front} Druck Brust / Stk.`}
                        </P>
                        <P klasse="!text-xs">
                            {veredelungPiece.back > 0 && `inkl. EUR ${veredelungPiece.back} Druck Rücken / Stk`}
                        </P>
                        {/* <P klasse="!text-xs text-successColor">
                            {discountApplied && `Rabatt von ${appliedDiscountPercentage.toFixed(2)}% angewendet!`}
                        </P> */}
                    </div>
                    {product.preisReduktion && (
                        <div className="mt-0 pl-16 flex items-end">
                            <ul className=" text-xs text-textColor !font-body tracking-wider">
                                {JSON.parse(product.preisReduktion.value).discounts.map((discount, index) => (
                                    <li key={index}>
                                        {discount.maxQuantity
                                            ? `Von ${discount.minQuantity} bis ${
                                                  discount.maxQuantity
                                              } Stück: EUR ${discount.price.toFixed(2)}`
                                            : `Ab ${discount.minQuantity} Stück: EUR ${discount.price.toFixed(2)}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </ContentWrapper>
        </div>
    );
}
