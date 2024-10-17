import React, { useState, useRef, useEffect } from "react";

//COMPS
import { FAQs } from "../../components/faqs";
//TYPO
import { H1, H2, P } from "../../components/typography";

// ANIMATION
import { motion, useInView } from "framer-motion";

const FAQSection = ({ klasse }) => {
    const parallaxRef5 = useRef(null);

    const faqData = [
        {
            question: "What is your return policy?",
            answer: "Our return policy allows returns within 30 days of purchase. The product must be in its original condition and packaging. Please keep the receipt for reference.",
        },
        {
            question: "How long does shipping take?",
            answer: "Shipping typically takes 5-7 business days within the country. International shipping may take up to 15 business days, depending on the destination.",
        },
        {
            question: "Do you offer customer support?",
            answer: "Yes, we offer 24/7 customer support via email, phone, and live chat. Our team is ready to assist you with any questions or concerns.",
        },
        {
            question: "Can I track my order?",
            answer: "Yes, once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on our website or the carrier's site.",
        },
        {
            question: "Are there any discounts available?",
            answer: "We frequently offer discounts and promotions. Please subscribe to our newsletter or follow us on social media to stay updated on the latest deals.",
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept a variety of payment methods including credit/debit cards, PayPal, and bank transfers. All transactions are securely processed.",
        },
    ];

    return (
        <>
            <div className="grid grid-cols-12 lg:px-24 lg:gap-x-6 lg:mt-10">
                <motion.div className="col-span-12 lg:col-span-12 h-auto z-10 x relative">
                    <H2 klasse="2">
                        <div className="">Häufig gestellte Fragen</div>
                    </H2>
                </motion.div>
                <div className="col-span-12 lg:col-span-12  pt-4 flex flex-col justify-center">
                    <FAQs data={faqData}></FAQs>
                </div>
            </div>
        </>
    );
};

export default FAQSection;

// data-scroll data-scroll-speed="3"
