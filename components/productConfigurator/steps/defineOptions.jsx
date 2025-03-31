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
import { calculateNetPrice } from "@/functions/calculateNetPrice";

export default function DefineOptions({ product, veredelungen, profiDatenCheck, layoutService }) {
    const { purchaseData, setPurchaseData } = useStore(); // Zustand global state

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

    const formattedVariants = formatVariants(product.variants);

    // Check for subvariant mode
    const useSubVariantMapping = product.tags && product.tags.includes("Kugelschreiber");

    // Pull out minOrder from product metafields
    const minOrder = product.mindestBestellMenge?.value ? parseInt(product.mindestBestellMenge?.value || 0, 10) : 0;

    // Parse the price model from Shopify
    useEffect(() => {
        if (product?.preisModell?.value) {
            const preisModellArray = JSON.parse(product.preisModell.value);
            setAllInclusive(preisModellArray.includes("Alles inklusive"));
        } else {
            setAllInclusive(false);
        }
    }, [product.preisModell]);

    /**
     * 1) Ensure the SELECTED color has a quantity of at least minOrder
     *    in the store if it doesn’t exist yet.
     *    (Only relevant if we’re using subVariantMapping)
     */
    useEffect(() => {
        if (useSubVariantMapping && purchaseData.selectedColor) {
            const key = purchaseData.selectedColor;
            const variantInStore = purchaseData.variants[key];
            if (!variantInStore) {
                // We do an initial set to minOrder
                const variantId = formattedVariants.Standard.colors.find((v) => v.color === key)?.id;

                setPurchaseData((prev) => ({
                    ...prev,
                    variants: {
                        ...prev.variants,
                        [key]: {
                            color: key,
                            quantity: minOrder,
                            id: variantId || null,
                        },
                    },
                }));
            }
        }
    }, [useSubVariantMapping, purchaseData.selectedColor, minOrder, formattedVariants, setPurchaseData]);

    /**
     * 2) Toggling “Profi Datencheck” updates the store & local total
     */
    const handleToggle = () => {
        const profiDatenCheckPrice = Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0);
        const profiDatenCheckId = profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.id || null;

        setIsChecked((prev) => {
            const newIsChecked = !prev;
            // If checked, store cost in purchaseData; if not, remove it
            const updatedVariants = { ...purchaseData.variants };
            if (newIsChecked) {
                updatedVariants.profiDatenCheck = {
                    id: profiDatenCheckId,
                    price: profiDatenCheckPrice,
                    quantity: 1,
                };
            } else {
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

    /**
     * 3) Price Calculation Effect
     *    Reads from purchaseData.variants & updates local states.
     */
    useEffect(() => {
        const discountData = product.preisReduktion ? JSON.parse(product.preisReduktion.value).discounts : null;

        const profiDatenCheckPrice = isChecked
            ? Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0)
            : 0;

        console.log(profiDatenCheckPrice);

        if (allInclusive) {
            // "All-Inclusive" mode
            const result = calculateTotalPriceAllInclusive(purchaseData.variants, product, discountData, purchaseData);
            // E.g.: { totalPrice, pricePerPiece, appliedDiscountPercentage, totalQuantity }

            const finalTotal = Number(result.totalPrice) + profiDatenCheckPrice;

            setTotalPrice(finalTotal);
            setPrice(finalTotal);
            setPricePerPiece(result.pricePerPiece);
            setVeredelungTotal("0.00");
            setVeredelungPerPiece({});
            setAppliedDiscountPercentage(result.appliedDiscountPercentage);
        } else {
            // "Non-All-Inclusive" mode
            const {
                totalPrice: complexTotal,
                pricePerPiece: complexPricePiece,
                appliedDiscountPercentage,
                veredelungTotal,
                veredelungPerPiece,
            } = calculateTotalPrice(
                purchaseData.variants,
                product,
                discountData,
                setDiscountApplied,
                veredelungen,
                purchaseData
            );

            // Add Profi Datencheck to final
            const numericTotalPrice = parseFloat(complexTotal) || 0;
            const withDataCheck = numericTotalPrice + profiDatenCheckPrice;

            setTotalPrice(withDataCheck);
            setPrice(withDataCheck);
            setPricePerPiece(Number(complexPricePiece));
            setVeredelungTotal(veredelungTotal);
            setVeredelungPerPiece(veredelungPerPiece);
            setAppliedDiscountPercentage(appliedDiscountPercentage);
        }

        // Update purchaseData with the final profiDatenCheckPrice
        setPurchaseData((prev) => ({
            ...prev,
            profiDatenCheckPrice,
        }));
    }, [purchaseData.variants, product, isChecked, allInclusive, veredelungen, setPurchaseData, profiDatenCheck]);

    /**
     * 4) Keep the store’s “price” up to date (if needed),
     *    but be careful not to cause loops. You may omit this if you want to store it only on checkout
     */
    useEffect(() => {
        setPurchaseData((prev) => ({
            ...prev,
            price: price,
            totalPrice: price,
            veredelungTotal: veredelungTotal,
            veredelungPerPiece: veredelungPerPiece,
        }));
    }, [price, veredelungTotal, veredelungPerPiece, setPurchaseData]);

    /**
     * 5) Track total quantity & median price
     */
    useEffect(() => {
        const total = calculateTotalQuantity(purchaseData);
        setTotalQuantity(total);
    }, [purchaseData.variants]);

    useEffect(() => {
        if (totalQuantity > 0) {
            console.log("MEDIAN PRICE", totalPrice, totalQuantity);
            const medianPrice = parseFloat((totalPrice / totalQuantity).toFixed(2));
            setMedianPricePerPiece(medianPrice);
        } else {
            setMedianPricePerPiece(0);
        }
    }, [totalPrice, totalQuantity]);

    /**
     * 6) Render
     */
    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={{ title: "Staffelung" }}>
                {/* Quantity Inputs */}
                {useSubVariantMapping
                    ? formattedVariants.Standard.colors.map((variant) => {
                          const isSelected = variant.color === purchaseData.selectedColor;
                          // We'll just use the "variant.color" as the key:
                          const key = variant.color;

                          // If not in store, fallback to 0
                          const currentVariant = purchaseData.variants?.[key] || {
                              color: variant.color,
                              quantity: 0,
                              id: variant.id,
                          };

                          return (
                              <NumberInputField
                                  key={variant.id}
                                  label={variant.color}
                                  value={currentVariant.quantity}
                                  // Let min=0 always. We'll rely on the total min in the calculation
                                  inputProps={{ min: 0 }}
                                  onIncrement={() => {
                                      let newQuantity =
                                          currentVariant.quantity === 0 ? minOrder : currentVariant.quantity + 1;

                                      setPurchaseData((prev) => ({
                                          ...prev,
                                          variants: {
                                              ...prev.variants,
                                              [key]: {
                                                  ...currentVariant,
                                                  quantity: newQuantity,
                                              },
                                          },
                                      }));
                                  }}
                                  onDecrement={() => {
                                      let newQuantity = 0;
                                      if (currentVariant.quantity > minOrder) {
                                          newQuantity = currentVariant.quantity - 1;
                                      } else {
                                          // quantity <= minOrder => jump to 0
                                          newQuantity = 0;
                                      }
                                      setPurchaseData((prev) => ({
                                          ...prev,
                                          variants: {
                                              ...prev.variants,
                                              [key]: {
                                                  ...currentVariant,
                                                  quantity: newQuantity,
                                              },
                                          },
                                      }));
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

                                      setPurchaseData((prev) => ({
                                          ...prev,
                                          variants: {
                                              ...prev.variants,
                                              [key]: {
                                                  ...currentVariant,
                                                  quantity: newQuantity,
                                              },
                                          },
                                      }));
                                  }}
                              />
                          );
                      })
                    : // Textiles or other products
                      Object.keys(formattedVariants).map((size) => {
                          const currentVariant = purchaseData.variants?.[size] || {
                              size,
                              color: purchaseData.selectedColor || null,
                              quantity: 0,
                              id:
                                  formattedVariants[size]?.colors?.find((c) => c.color === purchaseData.selectedColor)
                                      ?.id || null,
                          };

                          return (
                              <NumberInputField
                                  key={size}
                                  label={size}
                                  value={currentVariant.quantity}
                                  inputProps={{ min: 0 }}
                                  onIncrement={() => {
                                      const updatedId =
                                          formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)
                                              ?.id || null;
                                      setPurchaseData((prev) => ({
                                          ...prev,
                                          variants: {
                                              ...prev.variants,
                                              [size]: {
                                                  ...currentVariant,
                                                  quantity: currentVariant.quantity + 1,
                                                  id: updatedId,
                                              },
                                          },
                                      }));
                                  }}
                                  onDecrement={() => {
                                      if (currentVariant.quantity > 0) {
                                          const updatedId =
                                              formattedVariants[size]?.colors?.find(
                                                  (c) => c.color === currentVariant.color
                                              )?.id || null;
                                          setPurchaseData((prev) => ({
                                              ...prev,
                                              variants: {
                                                  ...prev.variants,
                                                  [size]: {
                                                      ...currentVariant,
                                                      quantity: currentVariant.quantity - 1,
                                                      id: updatedId,
                                                  },
                                              },
                                          }));
                                      }
                                  }}
                                  onChange={(e) => {
                                      let newQuantity = parseInt(e.target.value, 10) || 0;
                                      if (newQuantity < 0) newQuantity = 0;
                                      const updatedId =
                                          formattedVariants[size]?.colors?.find((c) => c.color === currentVariant.color)
                                              ?.id || null;
                                      setPurchaseData((prev) => ({
                                          ...prev,
                                          variants: {
                                              ...prev.variants,
                                              [size]: {
                                                  ...currentVariant,
                                                  quantity: newQuantity,
                                                  id: updatedId,
                                              },
                                          },
                                      }));
                                  }}
                              />
                          );
                      })}

                {/* Profi Datencheck Checkbox */}
                <div className="h-8"></div>
                <div className="flex bg-accentColor p-4">
                    <P klasse="!text-xs">
                        Wir checken Ihre Daten nach optimaler Drucktauglichkeit
                        <span className="font-semibold">
                            <br />+ {profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount} EUR
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
                            <H3 klasse="!mb-2">EUR {calculateNetPrice(price.toFixed(2))}</H3>
                            <P klasse="!text-xs mb-2 pl-2">
                                EUR {calculateNetPrice(medianPricePerPiece.toFixed(2))}/Stk.
                            </P>
                        </div>
                        {/* If you have front/back veredelung */}
                        <P klasse="!text-xs">
                            {veredelungPerPiece.front > 0 &&
                                `inkl. EUR ${calculateNetPrice(veredelungPerPiece.front)} Druck Brust / Stk.`}
                        </P>
                        <P klasse="!text-xs">
                            {veredelungPerPiece.back > 0 &&
                                `inkl. EUR ${calculateNetPrice(veredelungPerPiece.back)} Druck Rücken / Stk`}
                        </P>
                    </div>
                </motion.div>
            </ContentWrapper>
        </div>
    );
}
