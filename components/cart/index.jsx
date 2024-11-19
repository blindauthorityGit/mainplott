import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { FiX } from "react-icons/fi";
import Overlay from "../modal/overlay";
import { H2, H3, H5, P } from "@/components/typography";
import { TextField, InputAdornment, Button } from "@mui/material";
import { uploadPurchaseToFirestore } from "@/config/firebase"; // Import the upload function

export default function CartSidebar() {
    const {
        cartItems,
        isCartSidebarOpen,
        closeCartSidebar,
        removeCartItem,
        updateCartItem,
        setModalContent,
        setModalOpen,
        clearCart
    } = useStore();
    const [coupon, setCoupon] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Calculate the total price with or without discount
    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(discountApplied ? subtotal * 0.9 : subtotal); // 10% discount if applied
    }, [cartItems, discountApplied]);

    // Handle coupon code verification
    const handleCouponCheck = () => {
        if (coupon.toLowerCase() === "billige") {
            setDiscountApplied(true);
        } else {
            alert("Ungültiger Gutscheincode");
            setDiscountApplied(false);
        }
    };

    const handleIncrementQuantity = (id, quantity, unitPrice) => {
        const newQuantity = quantity + 1;
        updateCartItem(id, { quantity: newQuantity });
    };

    const handleDecrementQuantity = (id, quantity, unitPrice) => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            updateCartItem(id, { quantity: newQuantity });
        }
    };

    const handleCheckout = async () => {
        try {
            closeCartSidebar();
    
            // Prepare purchase data
            const cleanedCartItems = cartItems.map((item) => {
                const cleanedSides = Object.keys(item.sides || {}).reduce((acc, sideKey) => {
                    const { uploadedGraphicFile, ...rest } = item.sides[sideKey]; // Remove the File object
                    acc[sideKey] = rest; // Keep the rest of the properties
                    return acc;
                }, {});
            
                return {
                    ...item,
                    sides: cleanedSides, // Replace sides with cleaned data
                };
            });
            

            console.log(cleanedCartItems)
    
            const purchaseData = {
                cartItems: cleanedCartItems,
                totalPrice,
                customerName: "Test Kunde",
                date: new Date().toISOString(),
            };
    
            console.log("Starting Firestore upload...");
            console.log("Data to upload:", purchaseData);
    
            await uploadPurchaseToFirestore(purchaseData);
    
            setModalContent("Vielen Dank für Ihre Bestellung!");
            setModalOpen(true);
            clearCart();
    
            console.log("Purchase data saved successfully!");
        } catch (error) {
            console.error("Error saving purchase data:", error);
            setModalContent("Fehler beim Speichern der Bestellung.");
            setModalOpen(true);
        }
    };
    

    return (
        <AnimatePresence>
            {isCartSidebarOpen && (
                <>
                    <Overlay onClose={closeCartSidebar} />
                    <motion.div
                        className="fixed top-0 font-body right-0 h-full w-1/3 bg-white shadow-lg z-50 flex flex-col px-12 py-12"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            duration: 0.2,
                        }}
                    >
                        <button onClick={closeCartSidebar} className="self-end mb-6">
                            <FiX className="text-3xl" />
                        </button>

                        <H2 className="text-2xl font-bold mb-4">Ihr Einkaufswagen</H2>

                        <div className="flex-1 overflow-y-auto">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center mb-8">
                                        <img src={item.selectedImage} alt={item.productName} className="w-16 mr-4" />
                                        <div className="flex-1">
                                            <H5 klasse="!mb-2">{item.productName}</H5>
                                            <p className="text-sm">Color: {item.selectedColor || "N/A"}</p>
                                            <p className="text-sm">Size: {item.selectedSize || "N/A"}</p>
                                            <p className="text-sm">Price: €{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() =>
                                                    handleDecrementQuantity(item.id, item.quantity, item.unitPrice)
                                                }
                                                className="px-3 py-1 bg-gray-300 rounded-full"
                                            >
                                                -
                                            </button>
                                            <span className="px-4">{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    handleIncrementQuantity(item.id, item.quantity, item.unitPrice)
                                                }
                                                className="px-3 py-1 bg-gray-300 rounded-full"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeCartItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FiX className="text-lg" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>Your cart is empty.</p>
                            )}
                        </div>

                        {/* Coupon Code Input */}
                        <div className="my-4">
                            <TextField
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                variant="outlined"
                                placeholder="Gutscheincode eingeben"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button onClick={handleCouponCheck} variant="contained" color="primary">
                                                Prüfen
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        {/* Total Price */}
                        <div className="mt-4 mb-6">
                            <H3 klasse="!mb-2">Gesamtsumme: €{totalPrice.toFixed(2)}</H3>
                            {discountApplied && <P klasse="!text-sm text-successColor">Rabatt von 10% angewendet!</P>}
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
