import React, { useState } from "react";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { motion } from "framer-motion";
import ChoiceCard from "@/components/choiceCard"; // Card component for options
import { FiEdit, FiGrid } from "react-icons/fi"; // Example icons
import { P } from "@/components/typography";

export default function ChooseWay() {
    const { purchaseData, setPurchaseData } = useStore(); // Zustand global state
    const [selectedOption, setSelectedOption] = useState(purchaseData.configurator ? "configurator" : "template");

    // Update Zustand when an option is selected
    const handleSelection = (option) => {
        setSelectedOption(option);
        setPurchaseData({ ...purchaseData, configurator: option === "configurator" });
    };

    const stepData = {
        title: "DESIGN PLATZIEREN",
    };

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={stepData}>
                {/* Options */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <ChoiceCard
                        icon={FiGrid}
                        heading="Platzierung nach Vorlage"
                        description="Wähle vordefinierte Positionen für dein Design aus."
                        isActive={selectedOption === "template"}
                        configuratorValue={"template"}
                        onClick={() => handleSelection("template")}
                        klasse="w-1/2 sm:w-auto text-center"
                    />
                    <ChoiceCard
                        icon={FiEdit}
                        heading="Freie Platzierung"
                        description="Nutze den Konfigurator, um dein Design frei zu platzieren."
                        isActive={selectedOption === "configurator"}
                        configuratorValue={"config"}
                        onClick={() => handleSelection("configurator")}
                        klasse="w-1/2 sm:w-auto text-center"
                    />
                </div>

                {/* Description */}
                <motion.div
                    className="mt-6 text-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {selectedOption === "configurator" ? (
                        <P>
                            In the next step, you can use the configurator to drag, resize, and position your graphic
                            wherever you like.
                        </P>
                    ) : (
                        <P>Choose from standard placements like Top Left on Chest or Center Back with custom sizes.</P>
                    )}
                </motion.div>
            </ContentWrapper>
        </div>
    );
}
