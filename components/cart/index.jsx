// components/CartSidebar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { FiTrash2, FiX } from "react-icons/fi";
import Overlay from "../modal/overlay";
import { H5, P, H3 } from "@/components/typography";
import { TextField } from "@mui/material";
import prepareLineItems from "@/functions/prepareLineItems";
import { createCart } from "@/libs/shopify";

function getVariantLabel(variant) {
    if (!variant) return null;
    // 1) bevorzugt: Variant-Titel (so zeigt Shopify es auch)
    if (variant.title && !/Default Title/i.test(variant.title)) return variant.title;
    // 2) fallback: ausgewählte Optionen zusammenbauen
    if (Array.isArray(variant.selectedOptions) && variant.selectedOptions.length) {
        return variant.selectedOptions.map((o) => o.value).join(" / ");
    }
    return null;
}

export default function CartSidebar() {
    const { cartItems, isCartSidebarOpen, closeCartSidebar, removeCartItem, setModalContent, setModalOpen } =
        useStore();

    const [userNotes, setUserNotes] = useState("");
    const [totalPrice, setTotalPrice] = useState("0.00");

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
        setTotalPrice(subtotal.toFixed(2));
    }, [cartItems]);

    const handleCheckout = async () => {
        try {
            const lineItems = prepareLineItems(cartItems);
            const checkoutUrl = await createCart(lineItems, [], userNotes);
            if (!checkoutUrl) throw new Error("Checkout URL missing");
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error("❌ createCart failed:", err);
            setModalContent("Fehler beim Erstellen des Warenkorbs:\n" + err.message);
            setModalOpen(true);
        }
    };

    return (
        <AnimatePresence>
            {isCartSidebarOpen && (
                <>
                    <Overlay onClose={closeCartSidebar} />
                    <motion.div
                        className="fixed top-0 right-0 h-full lg:w-1/3 bg-white shadow-lg z-50 flex flex-col p-4 lg:px-12 lg:py-12"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.2 }}
                    >
                        <button onClick={closeCartSidebar} className="self-end mb-6">
                            <FiX className="text-3xl" />
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => {
                                    // --- HELFER: hübsches Label aus Shopify-Variante bauen (nur für Geschenke)
                                    const getVariantLabel = (variant) => {
                                        if (!variant) return null;
                                        if (variant.title && !/Default Title/i.test(variant.title))
                                            return variant.title;
                                        if (Array.isArray(variant.selectedOptions) && variant.selectedOptions.length) {
                                            return variant.selectedOptions.map((o) => o.value).join(" / ");
                                        }
                                        return null;
                                    };

                                    // --- 1) ORIGINAL-LOGIK für Textilien beibehalten -----------------------
                                    const hasVariantsObject = item.variants && Object.keys(item.variants).length > 0;

                                    let qtyDisplay;
                                    if (hasVariantsObject) {
                                        // Prüfe, ob es „klassische“ Größen-Einträge gibt (alles außer mainVariant)
                                        const sizeEntries = Object.entries(item.variants).filter(
                                            ([key, det]) => key !== "mainVariant" && det && det.quantity > 0
                                        );

                                        if (sizeEntries.length) {
                                            // → TEXTILIEN: 2x (M), 1x (L) …
                                            const parts = sizeEntries.map(
                                                ([size, det]) => `${det.quantity}x (${size})`
                                            );
                                            qtyDisplay = parts.join(", ");
                                        }
                                    }

                                    if (!qtyDisplay) {
                                        // Fallback der alten Logik
                                        if (item.selectedSize) {
                                            qtyDisplay = `${item.quantity || 0}x (${item.selectedSize})`;
                                        } else if (typeof item.quantity === "number") {
                                            qtyDisplay = `${item.quantity}x`;
                                        } else {
                                            qtyDisplay = "0x";
                                        }
                                    }

                                    // --- 2) ERGÄNZUNG für GESCHENKE (SimpleConfigurator) --------------------
                                    // Wenn eine konkrete Shopify-Variante gewählt wurde, zeige die stattdessen:
                                    // (überschreibt nur die Anzeige; LineItems-Logik bleibt unberührt)
                                    if (item.selectedVariant) {
                                        const mvQty = item?.variants?.mainVariant?.quantity;
                                        const qty = typeof mvQty === "number" ? mvQty : item.quantity || 1;
                                        const label = getVariantLabel(item.selectedVariant);
                                        if (label) qtyDisplay = `${qty}x (${label})`;
                                        else qtyDisplay = `${qty}x`;
                                    }

                                    return (
                                        <div key={item.id} className="flex items-center mb-8">
                                            <img
                                                src={
                                                    item.tryout
                                                        ? item.cartImage
                                                        : item.design?.front?.downloadURL ||
                                                          item.design?.back?.downloadURL ||
                                                          item.selectedImage ||
                                                          item.product?.images?.edges?.[0]?.node.originalSrc ||
                                                          ""
                                                }
                                                alt={item.productName}
                                                className="w-16 mr-4"
                                            />
                                            <div className="flex-1">
                                                <H5 klasse="!mb-1">{item.productName}</H5>
                                                <p className="text-sm">Menge: {qtyDisplay}</p>
                                                <p className="text-sm">
                                                    Preis: € {Number(item.totalPrice || 0).toFixed(2)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => removeCartItem(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FiTrash2 className="text-lg" />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <P>Ihr Einkaufswagen ist leer.</P>
                            )}
                        </div>

                        <div className="my-4">
                            <P klasse="mb-2 font-semibold">Besondere Anmerkungen:</P>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Ihre Anmerkungen..."
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                variant="outlined"
                            />
                        </div>

                        <div className="mt-4 mb-6">
                            <H3 klasse="!mb-2">Gesamtsumme: €{totalPrice}</H3>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full mt-6 bg-primaryColor text-white py-3 rounded-lg"
                        >
                            ZUR KASSE
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
