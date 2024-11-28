import React, { useState } from "react";

const CustomTextInput = ({ value, onChange, klasse, maxLength = 80, placeholder = "Type something..." }) => {
    const [charCount, setCharCount] = useState(value?.length || 0);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setCharCount(newValue.length);
            onChange(newValue);
        }
    };

    return (
        <div className={`flex flex-col font-body w-full space-y-2 mt-4 ${klasse}`}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 text-textColor bg-gray-100 border  rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textColor text-sm">
                    {charCount}/{maxLength}
                </span>
            </div>
            <p className="text-sm text-gray-500">Maximum {maxLength} characters allowed.</p>
        </div>
    );
};

export default CustomTextInput;
