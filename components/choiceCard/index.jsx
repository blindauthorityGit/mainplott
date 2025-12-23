import React from "react";
import { motion } from "framer-motion";
import useStore from "@/store/store";
import { H4, P } from "@/components/typography";
import { FiCheck } from "react-icons/fi";

export default function ChoiceCard({ icon: Icon, heading, description, configuratorValue, disabled = false }) {
    const { purchaseData, setPurchaseData } = useStore();
    const isActive = purchaseData.configurator === configuratorValue;

    const handleSelect = () => {
        if (disabled) return;
        setPurchaseData({
            ...purchaseData,
            configurator: configuratorValue,
            isLayout: configuratorValue === "layout",
        });
    };

    return (
        <motion.button
            type="button"
            onClick={handleSelect}
            disabled={disabled}
            className={[
                "group relative w-full flex-1 text-left focus:outline-none",
                "rounded-2xl transition-all",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
            whileHover={!disabled ? { y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.995 } : {}}
            aria-pressed={isActive}
        >
            {/* Offset-Shadow/Background */}
            <div className="pointer-events-none absolute -bottom-2 -right-2 w-full h-full rounded-2xl bg-accentColor/60" />

            {/* Card */}
            <div
                className={[
                    "relative z-[1] h-full rounded-2xl border",
                    "bg-accentColor/70",
                    "px-5 py-6 lg:px-8 lg:py-10",
                    "shadow-sm transition-all duration-200",
                    isActive
                        ? "border-primaryColor ring-2 ring-primaryColor/50"
                        : "border-gray-200 hover:shadow-md hover:border-primaryColor-300/70",
                ].join(" ")}
            >
                {/* Check-Badge when active */}
                {isActive && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primaryColor text-white px-2 py-1 text-xs font-semibold shadow">
                        <FiCheck className="text-sm" />
                        Ausgewählt
                    </span>
                )}

                {/* Icon in Badge */}
                <div className="flex justify-center">
                    <div
                        className={[
                            "mb-4 lg:mb-6 inline-flex items-center justify-center",
                            "h-14 w-14 lg:h-16 lg:w-16 rounded-xl",
                            "bg-white/90 border border-primaryColor-200 text-primaryColor-700",
                            "transition-colors",
                            "group-hover:border-primaryColor-300",
                            isActive ? "ring-1 ring-primaryColor/60" : "",
                        ].join(" ")}
                    >
                        <Icon className="text-2xl lg:text-3xl" />
                    </div>
                </div>

                {/* Text */}
                <H4 klasse="text-[15px] lg:text-xl font-bold text-center text-textColor mb-2">{heading}</H4>
                <P klasse="text-center !text-xs lg:!text-sm text-textColor/80 leading-relaxed">{description}</P>

                {/* Focus ring (keyboard) */}
                <span
                    className={[
                        "pointer-events-none absolute inset-0 rounded-2xl",
                        "ring-0 focus-within:ring-2 focus-within:ring-primaryColor/60",
                    ].join(" ")}
                />
            </div>
        </motion.button>
    );
}
