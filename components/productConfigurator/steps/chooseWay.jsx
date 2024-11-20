import React, { useState, useEffect } from "react";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { motion } from "framer-motion";
import ChoiceCard from "@/components/choiceCard"; // Card component for options
import { FiEdit, FiGrid } from "react-icons/fi"; // Example icons
import { H3, P } from "@/components/typography";

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

    // useEffect(() => {
    //     console.log("Current selection:", selectedOption);
    //     console.log(purchaseData);
    // }, [selectedOption]);

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <ContentWrapper data={stepData}>
                {/* Step Title */}
                {/* <H3 klasse="!mb-6 text-center">How would you like to place your design?</H3> */}

                {/* Options */}
                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                    {/* Custom Placement */}
                    {/* Template Placement */}
                    <ChoiceCard
                        icon={FiGrid}
                        heading="Platzierung nach Vorlage"
                        description="Wähle vordefinierte Positionen für dein Design aus."
                        isActive={selectedOption === "template"}
                        configuratorValue={"template"}
                        onClick={() => handleSelection("template")}
                    />{" "}
                    <ChoiceCard
                        icon={FiEdit}
                        heading="Freie Platzierung"
                        description="Nutze den Konfigurator, um dein Design frei zu platzieren."
                        isActive={selectedOption === "configurator"}
                        configuratorValue={"config"}
                        onClick={() => handleSelection("configurator")}
                    />
                </div>

                {/* Description */}
                <motion.div
                    className="mt-6 text-center"
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
