// NumberInputField.js
import React from "react";

const NumberInputField = ({ label, value, onIncrement, onDecrement, onChange }) => {
    return (
        <>
            <div className="flex items-center gap-4 mb-1 text-sm">
                <span className="flex-1 font-bold">{label}</span>

                {/* Decrement Button */}
                <button
                    onClick={onDecrement}
                    className="w-10 h-8 flex items-center justify-center border rounded text-lg font-semibold bg-gray-200 hover:bg-gray-300"
                >
                    -
                </button>

                {/* Number Input */}
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    className="w-16 h-8 text-center border rounded text-lg text-sm"
                />

                {/* Increment Button */}
                <button
                    onClick={onIncrement}
                    className="w-10 h-8 flex items-center justify-center border rounded text-lg font-semibold bg-gray-200 hover:bg-gray-300"
                >
                    +
                </button>
            </div>

            <hr className="bg-textColor mb-1 text-textColor border-textColor w-full opacity-30" />
        </>
    );
};

export default NumberInputField;
