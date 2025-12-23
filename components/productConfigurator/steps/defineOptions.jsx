import React, { useState, useEffect, useMemo } from "react";
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
import { isB2BUser, getUserPiecePrice } from "@/functions/priceHelpers";
import { getDecorationSummary } from "@/functions/decorationMode";

export default function DefineOptions({ product, veredelungen, profiDatenCheck, layoutService }) {
    const { purchaseData, setPurchaseData } = useStore();

    // ---------- CONFIG ----------
    // Netto pro Zusatzveredelung & Stück (kannst du später aus Metafield ziehen)
    const EXTRA_UNIT_NET = 3.5;

    // ---------- LOCAL STATE ----------
    const [isChecked, setIsChecked] = useState(purchaseData.profiDatenCheck || false);
    const [price, setPrice] = useState(0); // Gesamtpreis (mit Extras)
    const [pricePerPiece, setPricePerPiece] = useState(0); // Preis/Stk. (mit Extras)
    const [discountApplied, setDiscountApplied] = useState(false);
    const [allInclusive, setAllInclusive] = useState(false);
    const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [veredelungTotal, setVeredelungTotal] = useState(0);
    const [veredelungPerPiece, setVeredelungPerPiece] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [medianPricePerPiece, setMedianPricePerPiece] = useState(0);

    // ---------- HELPERS ----------
    const formattedVariants = formatVariants(product.variants);
    const useSubVariantMapping = product.tags && product.tags.includes("Kugelschreiber");
    const minOrder = product.mindestBestellMenge?.value ? parseInt(product.mindestBestellMenge.value, 10) : 0;
    const deco = getDecorationSummary(purchaseData);

    // robustes Fallback, falls du (noch) keine gespeicherten Zusatzfelder im Store hast
    const countExtrasFromSides = (pd) => {
        const sideNames = ["front", "back"];
        const out = { front: 0, back: 0, total: 0 };
        sideNames.forEach((side) => {
            const s = pd?.sides?.[side] || {};
            const texts = Array.isArray(s.texts) ? s.texts.length : 0;
            const graphics = Array.isArray(s.uploadedGraphics) ? s.uploadedGraphics.length : 0;
            const elements = texts + graphics;
            const extra = Math.max(0, elements - 1); // erste Veredelung pro Seite inklusive
            out[side] = extra;
            out.total += extra;
        });
        return out;
    };

    // Extras zählen (bevorzugt Werte aus Store, sonst Fallback)
    const extras = useMemo(() => {
        const stored = purchaseData?.extraDecorations || purchaseData?.zusatzveredelungen;
        if (stored && (typeof stored.front === "number" || typeof stored.back === "number")) {
            const front = stored.front || 0;
            const back = stored.back || 0;
            return { front, back, total: front + back };
        }
        return countExtrasFromSides(purchaseData);
    }, [purchaseData]);

    useEffect(() => {
        if (product?.preisModell?.value) {
            const preisModellArray = JSON.parse(product.preisModell.value);
            setAllInclusive(preisModellArray.includes("Alles inklusive"));
        } else {
            setAllInclusive(false);
        }
    }, [product.preisModell]);

    // Cleanup für Varianten (unverändert)
    useEffect(() => {
        setPurchaseData((prev) => {
            const updated = { ...prev };
            const newVariants = { ...updated.variants };
            if (useSubVariantMapping) {
                Object.entries(newVariants).forEach(([k, v]) => {
                    if (v && v.color && !v.size) delete newVariants[k];
                });
            } else {
                Object.entries(newVariants).forEach(([k, v]) => {
                    if (v && v.size && !v.color) delete newVariants[k];
                });
            }
            return { ...prev, variants: newVariants };
        });
    }, [useSubVariantMapping, setPurchaseData]);

    const handleToggle = () => {
        const profiDatenCheckPrice = Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0);
        const profiDatenCheckId = profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.id || null;
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

    // ---------- PRICE CALC ----------
    useEffect(() => {
        const discountData = product.preisReduktion ? JSON.parse(product.preisReduktion.value).discounts : null;
        const profiDatenCheckPrice = isChecked
            ? Number(profiDatenCheck[0]?.node?.variants?.edges[0]?.node?.price?.amount || 0)
            : 0;

        let productDiscount = 0;
        let baseTotal = 0;
        let basePricePerPiece = 0;
        let baseVeredelungTotal = 0;
        let baseVeredelungPerPiece = {};
        let baseAppliedDiscount = 0;

        if (allInclusive) {
            const result = calculateTotalPriceAllInclusive(purchaseData.variants, product, discountData, purchaseData);
            productDiscount = result.productDiscount ?? 0;
            baseTotal = Number(result.totalPrice) || 0;
            basePricePerPiece = Number(result.pricePerPiece) || 0;
            baseVeredelungTotal = 0;
            baseVeredelungPerPiece = {};
            baseAppliedDiscount = result.appliedDiscountPercentage || 0;
        } else {
            const res = calculateTotalPrice(
                purchaseData.variants,
                product,
                discountData,
                setDiscountApplied,
                veredelungen,
                purchaseData
            );
            productDiscount = res.productDiscount ?? 0;
            baseTotal = Number(res.totalPrice) || 0;
            basePricePerPiece = Number(res.pricePerPiece) || 0;
            baseVeredelungTotal = res.veredelungTotal || 0;
            baseVeredelungPerPiece = res.veredelungPerPiece || {};
            baseAppliedDiscount = res.appliedDiscountPercentage || 0;
        }

        // Menge
        const qty = calculateTotalQuantity(purchaseData);

        // ---- Zusatzveredelungen einpreisen (NETTO pro Stück) ----
        const extraPerPiece = extras.total * calculateNetPrice(EXTRA_UNIT_NET); // z.B. 2 Extras => 7,00€/Stk
        const extraTotal = extraPerPiece * qty;

        const finalTotal = baseTotal + extraTotal;
        const finalPricePerPiece = basePricePerPiece + extraPerPiece;

        // State & Store aktualisieren
        setTotalPrice(finalTotal);
        setPrice(finalTotal);
        setPricePerPiece(finalPricePerPiece);
        setVeredelungTotal(baseVeredelungTotal);
        setVeredelungPerPiece(baseVeredelungPerPiece);
        setAppliedDiscountPercentage(baseAppliedDiscount);

        setPurchaseData((old) => ({
            ...old,
            productDiscount,
            profiDatenCheckPrice,
            // nützlich für Checkout / Zusammenfassung
            extraDecorations: { front: extras.front, back: extras.back, total: extras.total },
            extraDecorationUnitNet: EXTRA_UNIT_NET,
            extraDecorationPerPieceNet: extraPerPiece,
            extraDecorationTotalNet: extraTotal,
        }));
    }, [
        purchaseData.variants,
        product,
        isChecked,
        allInclusive,
        veredelungen,
        setPurchaseData,
        profiDatenCheck,
        extras.front,
        extras.back,
        extras.total,
    ]);

    // Store-Preis spiegeln (unverändert)
    useEffect(() => {
        setPurchaseData((prev) => ({
            ...prev,
            price,
            totalPrice: price,
            veredelungTotal,
            veredelungPerPiece,
        }));
    }, [price, veredelungTotal, veredelungPerPiece, setPurchaseData]);

    // Menge & Mittelpreis pro Stück
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

    // ---------- RENDER HELPERS ----------
    const renderSubVariantMapping = () =>
        formattedVariants.Standard.colors.map((variant) => {
            const key = variant.color;
            const currentVariant = purchaseData.variants[key] || { color: variant.color, quantity: 0, id: variant.id };
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
                            newVariants[key] = { ...currentVariant, quantity: newQuantity };
                            return { ...prev, variants: newVariants };
                        });
                    }}
                    onDecrement={() => {
                        let newQuantity = currentVariant.quantity > minOrder ? currentVariant.quantity - 1 : 0;
                        setPurchaseData((prev) => {
                            const newVariants = { ...prev.variants };
                            if (newQuantity === 0) delete newVariants[key];
                            else newVariants[key] = { ...currentVariant, quantity: newQuantity };
                            return { ...prev, variants: newVariants };
                        });
                    }}
                    onChange={(e) => {
                        let typed = parseInt(e.target.value, 10) || 0;
                        let newQuantity = 0;
                        if (typed === 0) newQuantity = 0;
                        else if (typed < minOrder) newQuantity = minOrder;
                        else newQuantity = typed;

                        setPurchaseData((prev) => {
                            const newVariants = { ...prev.variants };
                            if (newQuantity === 0) delete newVariants[key];
                            else newVariants[key] = { ...currentVariant, quantity: newQuantity };
                            return { ...prev, variants: newVariants };
                        });
                    }}
                />
            );
        });

    const renderTextileMapping = () =>
        Object.keys(formattedVariants).map((size) => {
            const currentVariant = purchaseData.variants?.[size] || {
                size,
                color: purchaseData.selectedColor || null,
                quantity: 0,
                id: formattedVariants[size]?.colors?.find((c) => c.color === purchaseData.selectedColor)?.id || null,
            };
            return (
                <NumberInputField
                    key={size}
                    label={size === "Default Title" ? product.title : size}
                    value={currentVariant.quantity}
                    onIncrement={() => {
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

    // ---------- UI ----------
    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={{ title: "Staffelung" }}>
                {useSubVariantMapping ? renderSubVariantMapping() : renderTextileMapping()}

                {/* Profi Datencheck */}
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

                {/* Preisbereich */}
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

                        {/* Zusatzpositionen */}
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

                        {/* Basis-Veredelung pro Seite */}
                        <P klasse="!text-xs">
                            {veredelungPerPiece.front > 0 && `inkl. EUR ${veredelungPerPiece.front} Druck Brust / Stk.`}
                        </P>
                        <P klasse="!text-xs">
                            {veredelungPerPiece.back > 0 && `inkl. EUR ${veredelungPerPiece.back} Druck Rücken / Stk.`}
                        </P>

                        {/* Zusatzveredelungen Breakdown */}
                        {(extras.front > 0 || extras.back > 0) && (
                            <div className="mt-1 text-xs text-gray-800">
                                <div>
                                    + Zusatzveredelung: {extras.total}× à EUR{" "}
                                    {calculateNetPrice(EXTRA_UNIT_NET.toFixed(2))} / Stk.
                                </div>
                                <div className="mt-1 flex gap-2">
                                    {extras.front > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200">
                                            {extras.front}× Front
                                        </span>
                                    )}
                                    {extras.back > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200">
                                            {extras.back}× Rücken
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Veredelungs-Zusammenfassung (existing chips) */}
                        {/* {deco.front || deco.back ? (
                            <div className="mt-1 flex gap-2">
                                {deco.front > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200">
                                        {deco.front}× Front
                                    </span>
                                )}
                                {deco.back > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200">
                                        {deco.back}× Rücken
                                    </span>
                                )}
                            </div>
                        ) : (
                            <P klasse="!text-xs text-gray-500">Keine Veredelungen</P>
                        )} */}
                    </div>
                </motion.div>
            </ContentWrapper>
        </div>
    );
}
