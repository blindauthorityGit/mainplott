import React from "react";
import { H2, P } from "@/components/typography";
import useStore from "@/store/store"; // Zustand store
import { motion } from "framer-motion"; // Optional for animations

const ContentWrapper = ({ data, klasse, children, showToggle }) => {
    const { purchaseData, setPurchaseData } = useStore();

    const handleToggle = () => {
        const newConfigurator = purchaseData.configurator === "configurator" ? "template" : "configurator";
        setPurchaseData({ ...purchaseData, configurator: newConfigurator });
        console.log(purchaseData);
    };

    return (
        <div className={`${klasse} relative`}>
            {/* Heading and Button Row */}
            <div className="flex justify-between items-center">
                <H2>{data.title}</H2>
                {showToggle && (
                    <motion.button
                        onClick={handleToggle}
                        className={`ml-4 px-4 py-2 text-sm font-semibold rounded border-2 transition ${
                            purchaseData.configurator === "configurator"
                                ? "bg-primaryColor text-white border-primaryColor"
                                : "bg-gray-200 text-black border-gray-400"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {purchaseData.configurator === "configurator" ? "Custom Placement" : "Template Placement"}
                    </motion.button>
                )}
            </div>

            {/* Description and Children */}
            <P klasse="text-xs hidden lg:block lg:!text-sm">{data.description}</P>
            {children}
            <P klasse="text-xs lg:hidden lg:!text-sm">{data.description}</P>
        </div>
    );
};

export default ContentWrapper;
