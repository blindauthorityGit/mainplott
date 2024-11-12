import React from "react";
import { motion } from "framer-motion";
import { MdCheck } from "react-icons/md";

const GeneralCheckBox = ({
    label,
    isChecked,
    onClick,
    onToggle, // Neuer Prop für das Umschalten von Zuständen
    activeClass = "",
    nonActiveClass = "bg-background",
    borderColor = "border-textColor",
    checkColor = "text-successColor",
    strokeColor = "bg-background",
    klasse,
    style,
    containerStyle,
}) => {
    const handleToggle = () => {
        // onClick(); // Checkbox-Status umschalten
        if (onToggle) {
            onToggle(!isChecked); // Callback mit dem neuen Zustand
        }
    };

    return (
        <div
            onClick={handleToggle}
            className="flex items-center cursor-pointer font-body space-x-3 my-6 lg:my-0"
            style={{ ...style }}
        >
            {/* Checkbox Container */}
            <motion.div
                className={`relative w-10 h-10 rounded-[10px] border-2 ${borderColor} flex items-center justify-center 
                    ${isChecked ? activeClass : nonActiveClass} ${klasse}`}
                initial={{ scale: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ containerStyle }}
            >
                {/* Checkmark mit Umrandung */}
                {isChecked && (
                    <motion.div
                        className={`absolute -top-1 -right-1 rounded-full ${strokeColor} flex items-center justify-center`}
                        style={{ padding: "1px" }}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1.1, rotate: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <MdCheck size={28} className={`${checkColor}`} />
                    </motion.div>
                )}

                {/* Rahmenkanten-Animation bei Aktivierung */}
                {isChecked && (
                    <motion.div
                        className="absolute top-0 right-0 w-1/2 h-1/2 bg-successColor rounded-tr-lg"
                        initial={{ width: "100%", height: "100%" }}
                        animate={{ width: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                )}
            </motion.div>

            {/* Label für die Checkbox */}
            <div className="text-sm font-semibold text-gray-800">{label}</div>
        </div>
    );
};

export default GeneralCheckBox;
