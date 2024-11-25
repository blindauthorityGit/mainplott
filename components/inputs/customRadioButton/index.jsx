import React from "react";

const CustomRadioButton = ({ id, name, label, icon, value, checked, onChange }) => {
    return (
        <div className="flex items-center  p-2 cursor-pointer">
            {/* Label */}

            {/* Radio Button */}
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={(e) => onChange(e.target.value)}
                className="mx-2"
            />
            <label htmlFor={id} className="text-gray-700 font-medium">
                {label}
            </label>
            {/* Custom Icon */}
            {icon && <div className="w-10 h-10 flex items-center justify-center">{icon}</div>}
        </div>
    );
};

export default CustomRadioButton;
