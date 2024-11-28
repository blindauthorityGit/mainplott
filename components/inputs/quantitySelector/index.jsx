import React, { useState } from "react";
import { motion } from "framer-motion";

const QuantitySelector = ({ quantity, setQuantity, onQuantityChange }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        onQuantityChange(newQuantity); // Notify parent of the new quantity
    };

    const handleDecrease = () => {
        const newQuantity = Math.max(1, quantity - 1);
        setQuantity(newQuantity);
        onQuantityChange(newQuantity); // Notify parent of the new quantity
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            setQuantity(newQuantity);
            onQuantityChange(newQuantity); // Notify parent of the new quantity
        }
    };

    const handleBlur = () => setIsEditing(false);

    return (
        <div className="flex items-center space-x-4 mb-4 mt-8">
            <motion.button
                onClick={handleDecrease}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-lg font-semibold hover:bg-gray-300"
                whileTap={{ scale: 0.9 }}
            >
                -
            </motion.button>

            <div
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center font-base text-lg w-16 text-center border border-gray-300 rounded-md cursor-pointer px-2"
            >
                {isEditing ? (
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onBlur={handleBlur}
                        autoFocus
                        className="w-full text-center border-none outline-none"
                    />
                ) : (
                    <span>{quantity}</span>
                )}
            </div>

            <motion.button
                onClick={handleIncrease}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-lg font-semibold hover:bg-gray-300"
                whileTap={{ scale: 0.9 }}
            >
                +
            </motion.button>
        </div>
    );
};

export default QuantitySelector;
