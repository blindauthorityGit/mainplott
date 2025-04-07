import React, { useState } from "react";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { motion } from "framer-motion";
import ChoiceCard from "@/components/choiceCard"; // Card component for options
import { FiEdit, FiGrid, FiPenTool } from "react-icons/fi";
import { P } from "@/components/typography";

export default function ChooseWay({ product }) {
    const { purchaseData, setPurchaseData } = useStore(); // Zustand global state
    const [selectedOption, setSelectedOption] = useState(purchaseData.configurator ? "configurator" : "template");

    // Update Zustand when an option is selected
    const handleSelection = (option) => {
        setSelectedOption(option);
        setPurchaseData((prev) => ({
            ...prev,
            configurator: option === "configurator",
            isLayout: option === "layout",
        }));
    };

    const stepData = {
        title: "IHR DESIGN ",
    };

    return (
        <div className="lg:px-16 lg:mt-4 2xl:mt-8 font-body">
            <ContentWrapper data={stepData}>
                {/* Options */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <ChoiceCard
                        icon={FiGrid}
                        heading="Platzierung nach Vorlage"
                        description="Wählen Sie vordefinierte Positionen für ihr Design aus"
                        isActive={selectedOption === "template"}
                        configuratorValue={"template"}
                        onClick={() => handleSelection("template")}
                        klasse="w-1/2 sm:w-auto text-center"
                    />
                    <ChoiceCard
                        icon={FiEdit}
                        heading="Freie Platzierung"
                        description="Nutzen Sie den Konfigurator, um ihr Design frei zu platzieren"
                        isActive={selectedOption === "configurator"}
                        configuratorValue={"config"}
                        onClick={() => handleSelection("configurator")}
                        klasse="w-1/2 sm:w-auto text-center"
                    />
                </div>
                {/* <div className="w-full text-center my-4">oder</div> */}
                {product?.layout?.value && (
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        <ChoiceCard
                            icon={FiPenTool}
                            heading="Layout erstellen lassen"
                            description="Wir erstellen ihr Layout nach ihren Vorgaben"
                            isActive={selectedOption === "layout"}
                            configuratorValue={"layout"}
                            onClick={() => handleSelection("layout")}
                            klasse="w-full sm:w-auto text-center"
                        />
                    </div>
                )}

                {/* Description */}
                {/* <motion.div
                    className="mt-6 text-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {selectedOption == "configurator" ? (
                        <P>
                            In the next step, you can use the configurator to drag, resize, and position your graphic
                            wherever you like.
                        </P>
                    ) : (
                        <P>Choose from standard placements like Top Left on Chest or Center Back with custom sizes.</P>
                    )}
                </motion.div> */}
            </ContentWrapper>
        </div>
    );
}
