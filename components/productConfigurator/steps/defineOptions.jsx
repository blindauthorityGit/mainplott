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

export default function DefineOptions({ product }) {
    const { purchaseData, setPurchaseData } = useStore(); // Zustand global state
    const [isChecked, setIsChecked] = useState(purchaseData.profiDatenCheck || false); // Initialize based on Zustand state

    const [quantity, setQuantity] = useState(1);
    const [veredelung, setVeredelung] = useState("");
    const [coupon, setCoupon] = useState("");
    const [price, setPrice] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0); // Track the applied discount percentage

    const [additionalInfo, setAdditionalInfo] = useState("");

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
        setIsChecked((prev) => !prev);
        setPurchaseData({
            ...purchaseData,
            profiDatenCheck: !purchaseData.profiDatenCheck, // Toggle profiDatenCheck in Zustand
        });
    };

    // Fetch the price based on product configuration
    const fetchPrice = () => {
        let basePrice = 50;
        let veredelungMultiplier = veredelung ? 1.2 : 1;
        let profiCheckMultiplier = isChecked ? 1.15 : 1;
        let totalPrice = basePrice * quantity * veredelungMultiplier * profiCheckMultiplier;

        // Apply discount if coupon code is valid
        if (coupon.toLowerCase() === "billige" && discountApplied) {
            totalPrice *= 0.9; // 10% discount
        }

        setPrice(totalPrice);
        // Update the price in Zustand store directly after setting it locally
        setPurchaseData((prevData) => ({
            ...prevData,
            price: totalPrice,
        }));
    };

    useEffect(() => {
        fetchPrice();
    }, [quantity, veredelung, coupon, discountApplied, isChecked, price]);

    useEffect(() => {
        setPurchaseData({
            ...purchaseData,
            price: price,
        });
    }, [price]);

    useEffect(() => {
        // Parse discount data from product
        const discountData = product.preisReduktion ? JSON.parse(product.preisReduktion.value).discounts : null;

        // Calculate total price with discount handling
        const { totalPrice, appliedDiscountPercentage } = calculateTotalPrice(
            purchaseData.variants,
            product,
            discountData,
            setDiscountApplied
        );
        setPrice(totalPrice);
        setAppliedDiscountPercentage(appliedDiscountPercentage); // Update the discount percentage
    }, [purchaseData, product]);

    useEffect(() => {
        console.log("WEIR HABEN DISCOUNT");
    }, [discountApplied]);

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
                    };
                    // console.log(size);
                    // console.log(purchaseData.variants?.[size]);

                    return (
                        <NumberInputField
                            key={size}
                            label={size}
                            value={currentVariant.quantity} // Prefill with the current quantity for this size
                            onIncrement={() => {
                                setPurchaseData({
                                    ...purchaseData,
                                    variants: {
                                        ...purchaseData.variants, // Preserve other sizes
                                        [size]: {
                                            ...currentVariant, // Preserve current variant details (size, color)
                                            quantity: currentVariant.quantity + 1, // Increment quantity
                                        },
                                    },
                                });
                            }}
                            onDecrement={() => {
                                if (currentVariant.quantity > 0) {
                                    setPurchaseData({
                                        ...purchaseData,
                                        variants: {
                                            ...purchaseData.variants, // Preserve other sizes
                                            [size]: {
                                                ...currentVariant, // Preserve current variant details (size, color)
                                                quantity: currentVariant.quantity - 1, // Decrement quantity
                                            },
                                        },
                                    });
                                }
                            }}
                            onChange={(e) => {
                                const newQuantity = parseInt(e.target.value, 10) || 0;
                                setPurchaseData({
                                    ...purchaseData,
                                    variants: {
                                        ...purchaseData.variants, // Preserve other sizes
                                        [size]: {
                                            ...currentVariant, // Preserve current variant details (size, color)
                                            quantity: newQuantity, // Set new quantity
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
                <GeneralCheckBox
                    label="Profi Datencheck?"
                    isChecked={isChecked}
                    onToggle={handleToggle} // Only pass onToggle
                    activeClass=""
                    nonActiveClass="bg-background"
                    borderColor="border-textColor"
                    checkColor="text-successColor"
                />

                {/* Price Display */}
                <motion.div
                    className="mt-6 flex"
                    initial={{ scale: 1 }}
                    animate={{ scale: discountApplied ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div>
                        <H3 klasse="!mb-2">EUR {price}</H3>
                        <P klasse="!text-xs text-successColor">
                            {discountApplied && `Rabatt von ${appliedDiscountPercentage.toFixed(2)}% angewendet!`}
                        </P>
                    </div>
                    {product.preisReduktion && (
                        <div className="mt-4 pl-16">
                            <ul className=" text-xs text-textColor !font-body">
                                {JSON.parse(product.preisReduktion.value).discounts.map((discount, index) => (
                                    <li key={index}>
                                        {discount.maxQuantity
                                            ? `Von ${discount.minQuantity} bis ${discount.maxQuantity} Stück: ${discount.discountPercentage}% Rabatt`
                                            : `Ab ${discount.minQuantity} Stück: ${discount.discountPercentage}% Rabatt`}
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
