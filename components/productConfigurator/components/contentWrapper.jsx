import React from "react";
import { H2, P } from "@/components/typography";
import useStore from "@/store/store"; // Zustand store
import { motion } from "framer-motion"; // Optional for animations
import { FiRepeat, FiLayout } from "react-icons/fi"; // Icons for the button

const ContentWrapper = ({ data, klasse, children, showToggle }) => {
    const { purchaseData, setPurchaseData } = useStore();

    const handleToggle = () => {
        // Ensure the configurator switches correctly on the first click
        setPurchaseData((prevData) => {
            const newConfigurator = prevData.configurator === "configurator" ? "template" : "configurator";

            return { ...prevData, configurator: newConfigurator };
        });
    };

    const RichTextRenderer = ({ htmlContent }) => {
        if (!htmlContent) {
            // console.error("No HTML content provided");
            return null;
        }

        return (
            <div
                className="text-sm tracking-widest text-darkGrey sm:text-base md:text-lg font-body  xl:leading-relaxed lg:text-base xl:text-sm 2xl:text-base 3xl:text-[1rem] 3xl:leading-7  !text-xs mb-6 lg:mb-0  lg:block 2xl:!text-sm"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            ></div>
        );
    };

    return (
        <div className={`${klasse} relative`}>
            {/* Heading and Button Row */}
            <div className="flex justify-between items-center">
                <H2 klasse="!text-3xl lg:!text-6xl md:!text-3xl lg:!text-6xl xl:!text-5xl 2xl:!text-7xl ">
                    {data.title}
                </H2>
                {showToggle && (
                    <motion.button
                        onClick={handleToggle}
                        className="flex items-center space-x-2 text-primaryColor hover:text-primaryColor-dark font-semibold text-lg transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {purchaseData.configurator === "configurator" ? (
                            <>
                                <FiLayout size={20} />
                                <span>Wechsel zu Vorlagen</span>
                            </>
                        ) : (
                            <>
                                <FiRepeat size={20} />
                                <span>Freie Platzierung</span>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Description and Children */}
            {/* <P klasse="!text-xs hidden lg:block 2xl:!text-sm">{data.descriptionHtml}</P> */}
            <RichTextRenderer htmlContent={data.descriptionHtml}></RichTextRenderer>
            {children}
            {/* <P klasse="text-xs lg:hidden lg:!text-sm mt-4">{data.description}</P> */}
        </div>
    );
};

export default ContentWrapper;
