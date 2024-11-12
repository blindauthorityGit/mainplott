import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { FiX } from "react-icons/fi";
import Overlay from "../modal/overlay"; // Import the Overlay component
import { H2, H3, H4, P } from "@/components/typography";
import { TextField, InputAdornment, Button } from "@mui/material"; // For coupon input

export default function CartSidebar() {
    const { cartItems, isCartSidebarOpen, closeCartSidebar, removeCartItem } = useStore();
    const [coupon, setCoupon] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Calculate the total price with or without discount
    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
        setTotalPrice(discountApplied ? subtotal * 0.9 : subtotal); // 10% discount if applied
    }, [cartItems, discountApplied]);

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
        <AnimatePresence>
            {isCartSidebarOpen && (
                <>
                    <Overlay onClose={closeCartSidebar} />
                    <motion.div
                        className="fixed top-0 font-body right-0 h-full w-1/3 bg-white shadow-lg z-50 flex flex-col px-12 py-8"
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
                        {/* Close Button */}
                        <button onClick={closeCartSidebar} className="self-end mb-6">
                            <FiX className="text-3xl" />
                        </button>

                        {/* Sidebar Content */}
                        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center mb-8">
                                        <img src={item.image} alt={item.productName} className="w-16 h-16 mr-4" />
                                        <div className="flex-1">
                                            <H4 klasse=" !mb-2">{item.productName}</H4>
                                            <p>Color: {item.selectedColor || "N/A"}</p>
                                            <p>Size: {item.selectedSize || "N/A"}</p>
                                            <p>Price: €{item.price.toFixed(2)}</p>
                                        </div>
                                        {/* Delete Button */}
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

                        {/* Buy Now Button */}
                        <button className="w-full mt-6 bg-primaryColor text-white py-3 rounded-lg">Buy Now</button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
