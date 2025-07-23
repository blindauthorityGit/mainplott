// components/CartSidebar.jsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { FiTrash2, FiX } from "react-icons/fi";
import Overlay from "../modal/overlay";
import { H5, P, H3 } from "@/components/typography";
import { TextField } from "@mui/material";
import prepareLineItems from "@/functions/prepareLineItems";
import { createCart } from "@/libs/shopify";

export default function CartSidebar() {
    const { cartItems, isCartSidebarOpen, closeCartSidebar, removeCartItem, setModalContent, setModalOpen } =
        useStore();

    const [userNotes, setUserNotes] = useState("");
    const [totalPrice, setTotalPrice] = useState("0.00");

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        setTotalPrice(subtotal.toFixed(2));
    }, [cartItems]);

    const handleCheckout = async () => {
        try {
            const lineItems = prepareLineItems(cartItems);
            const checkoutUrl = await createCart(lineItems, [], userNotes);
            console.log(lineItems);
            console.log(checkoutUrl);
            if (!checkoutUrl) throw new Error("Checkout URL missing");
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error("❌ createCart failed:", err);
            setModalContent("Fehler beim Erstellen des Warenkorbs:\n" + err.message);
            setModalOpen(true);
        }
    };

    function closeSideBar() {
        console.log("BUBUBUBU");
        closeCartSidebar();
    }

    console.log(cartItems);

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
                        <button onClick={() => closeCartSidebar()} className="self-end mb-6">
                            <FiX className="text-3xl" />
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => {
                                    // do we have per-size variants?
                                    const hasVariants = item.variants && Object.keys(item.variants).length > 0;

                                    // build quantity string
                                    let qtyDisplay;
                                    if (hasVariants) {
                                        const parts = Object.entries(item.variants)
                                            .filter(([, det]) => det.quantity > 0)
                                            .map(([size, det]) => `${det.quantity}x (${size})`);
                                        qtyDisplay = parts.length ? parts.join(", ") : "0";
                                    } else if (item.selectedSize) {
                                        qtyDisplay = `${item.quantity || 0}x (${item.selectedSize})`;
                                    } else {
                                        qtyDisplay = item.quantity != null ? item.quantity : "0";
                                    }

                                    return (
                                        <div key={item.id} className="flex items-center mb-8">
                                            {item.product.handle && (
                                                <Link
                                                    onClick={closeSideBar}
                                                    href={`/products/${item.product.handle}?editIndex=${index}`}
                                                    prefetch={false}
                                                >
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
                                                </Link>
                                            )}
                                            <div className="flex-1">
                                                <H5 klasse="!mb-2">{item.productName}</H5>

                                                <p className="text-sm">Menge: {qtyDisplay}</p>

                                                <p className="text-sm">Preis: € {Number(item.totalPrice).toFixed(2)}</p>
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

                        {/* User notes */}
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

                        {/* Total & Checkout */}
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
