import React, { useState } from "react";
import { motion } from "framer-motion";

//ASSETS
import Triangle from "../../assets/icons/triangle.svg";

const Element = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAnswer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="outer font-body mb-2 lg:mb-4">
            <div
                className="question bg-white text-lg lg:text-2xl font-semibold flex items-center p-4 lg:p-8 justify-between cursor-pointer"
                onClick={toggleAnswer}
            >
                {question}
                <motion.img
                    src={Triangle.src}
                    alt="Toggle"
                    className={`ml-2 transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <motion.div
                className="answer bg-primaryColor-100  text-base overflow-hidden"
                initial="collapsed"
                animate={isOpen ? "open" : "collapsed"}
                variants={{
                    open: { height: "auto", opacity: 1 },
                    collapsed: { height: 0, opacity: 0 },
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="p-8">{answer}</div>
            </motion.div>
        </div>
    );
};

export default Element;
